const express = require('express');
const router = express.Router();
const http = require('axios');
const nanoid = require('nanoid');
const url = require('url');
const { Console } = require('console');

router.get('/', function(req, res, next) {
  const query = req.query;
  
  // *********************************************************
  // TODO: 1. Extract iss and launch parameters from Launch request query
  
  //const iss = null;
  //const launch = null;
  // ---------------------------------------------------------
  const iss = query.iss;
  const launch = query.launch;
  
  // *********************************************************
  
  console.log("--- Launch Request Parameters ---");
  console.log(`iss: ${iss}`);
  console.log(`launch: ${launch}`);

  if (!iss && !launch) 
  {
    res.statusCode = 400;
    return res.send("iss and launch parameters must be provided");
  } 

  // **********************************************************
  // TODO: 2. Build Authorization Discover Request URL
  
  //const smart_config_url = null;
  // ----------------------------------------------------------
  const smart_config_url = iss + '/.well-known/smart-configuration';
  
  // **********************************************************
  
  console.log("--- Authorization Discovery Request ---");
  console.log(`GET ${smart_config_url}`);
  
  // GET smart-configuration
  http.get(smart_config_url)
  .then(function (response) {
    const config_data = response.data;
    
    // **********************************************************************
    // TODO: 3. Extract authorization_endpoint and token_endpoint config_data
    
    //const authorization_endpoint =  null;
    //const token_endpoint = null;
    // ----------------------------------------------------------------
    const authorization_endpoint =  config_data.authorization_endpoint;
    const token_endpoint = config_data.token_endpoint;

    // **********************************************************************

    console.log("--- Authorization Discovery Response - extracted ---");
    console.log(`authorization_endpoint: ${authorization_endpoint}`);
    console.log(`token_endpoint: ${token_endpoint}`);
    console.log("----------------------------------------------------");
    
    // save token_endpoint in session for use later
    req.session.token_endpoint = token_endpoint;

    // --- Start building the Authorization Request ---
    
    // generate unique state for this Authorize request and save in session for later
    const state = nanoid();
    req.session.state = state;

    // retreive the Client ID from the App settings
    const client_id = req.app.locals.client_id;
    
    // build scopes string containing Launch and Authorization scopes
    const launch_scopes = 'launch launch/patient openid fhirUser';
    const auth_scopes = 'patient/*.rs';
    const scopes = launch_scopes + " " + auth_scopes

    // build redirect URL
    const redirect_url = url.format({ 
      protocol: req.protocol, host: req.get('host'), pathname: "authcallback" });
    
    // ********************************************
    // TODO: 4. construct authorize parameters 
    
    // const authorize_parameters = { };
    // ---------------------------------
    const authorize_parameters = {
      response_type: "code",
      client_id: client_id,
      redirect_uri: redirect_url,
      aud: iss,
      state: state,
      scope: scopes,
      launch: launch
    };
    
    // ********************************************

    console.log(JSON.stringify(authorize_parameters, null, 2));

    const authorization_url = url.parse(authorization_endpoint);
    authorization_url.query = authorize_parameters;
    const auth_req = url.format(authorization_url);

    console.log("--- Authorization Request ---");
    console.log(`GET ${auth_req}`);
    console.log("--- Launch redirecting to Authorization ---");

    // Redirect to Authorize endpoint
    res.redirect(auth_req);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
    next(error);
  });
  
  req.session.fhir_base_url = iss;
  
});

module.exports = router;
