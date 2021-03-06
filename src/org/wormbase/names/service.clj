(ns org.wormbase.names.service
  (:require
   [compojure.api.exception :as ex]
   [compojure.api.sweet :as sweet]
   [environ.core :as environ]
   [mount.core :as mount]
   [muuntaja.core :as muuntaja]
   [org.wormbase.db :as own-db]
   [org.wormbase.db.schema :as own-db-schema]
   [org.wormbase.names.auth :as own-auth]
   [org.wormbase.names.errhandlers :as own-eh]
   [org.wormbase.names.gene :as own-gene]
   [org.wormbase.names.user :as own-user]
   [org.wormbase.specs.auth :as auth-spec]
   [org.wormbase.names.auth.restructure] ;; Included for side effects
   [ring.middleware.gzip :as ring-gzip]
   [ring.util.http-response :as http-response]
   [compojure.api.middleware :as mw]
   [muuntaja.core :as m])
  (:import
   (java.util.concurrent ExecutionException)))


(def default-format "application/edn")

(def ^{:private true
       :doc "Request/Response format configuration"} mformats
  (muuntaja/create
    (muuntaja/select-formats
      muuntaja/default-options
      ["application/edn"
       "application/transit+json"
       "application/json"])))

(defn- wrap-not-found
  "Fallback 404 handler."
  [request-handler]
  (fn [request]
    (let [response (request-handler request)]
      (or response
          (-> {:reason "These are not the worms you're looking for"}
              (http-response/not-found)
              (http-response/content-type default-format))))))

(defn decode-content [mime-type content]
  (muuntaja/decode mformats mime-type content))

(def ^:private swagger-validator-url
  "The URL used to validate the swagger JSON produced by the application."
  (if-let [validator-url (environ/env :swagger-validator-url)]
    validator-url
    "//online.swagger.io/validator"))

(def ^{:doc "Configuration for the Swagger UI."} swagger-ui
  {:ui "/"
   :spec "/swagger.json"
   :ignore-missing-mappings? false
   :data
   {:info
    {:title "Wormbase name service"
     :description "Provides naming operations for WormBase entities."}

    ;; TODO: look up how to define securityDefinitions properly!
    ;;       will likely need to add some middleware such that the info
    ;;       can vary depending on the user-agent...
    ;;       i.e scripts will use Bearer auth, browser will use... (?)
    :securityDefinitions
    {:login
     {:type "http"
      :scheme "bearer"}}
    :tags
    [{:name "api"}
     {:name "feature"}
     {:name "gene"}
     {:name "variation"}
     {:name "user"}]}})

(def ^{:doc "The main application."} app
  (sweet/api
   {:coercion :spec
    :formats mformats
    :middleware [ring-gzip/wrap-gzip
                 own-auth/wrap-app-session
                 own-db/wrap-datomic
                 wrap-not-found]
    :exceptions
    {:handlers
     {ExecutionException own-eh/handle-txfn-error

      ;; TODO: this shouldn't really be here...spec not tight enough?
      datomic.impl.Exceptions$IllegalArgumentExceptionInfo own-eh/handle-txfn-error

      ::own-db-schema/validation-error own-eh/handle-validation-error
      ::ex/request-validation own-eh/handle-request-validation
      ::ex/default own-eh/handle-unexpected-error}}
    :swagger swagger-ui}
   (sweet/context "" []
     ;; TODO: is it right to be
     ;; repating the authorization and auth-rules params below so that
     ;; the not-found handler doesn't raise validation error?
     own-user/routes
     own-gene/routes)))

(defn init
  "Entry-point for ring server initialization."
  []
  (mount/start))
