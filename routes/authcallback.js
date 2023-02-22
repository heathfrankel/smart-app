const express = require('express');
const router = express.Router();
const http = require('axios');
const qs = require('qs');
const url = require('url');

// Authorize Callback 
router.get('/', function(req, res, next) {
  const query = req.query;
  
  // *********************************************************
  // TODO: 5. extract code and state parameters from query parameters
  
  //const code = null;
  //const state = null;
  // ---------------------------------------------------------
  const code = query.code;
  const state = query.state;
  
  // *********************************************************

  console.log("--- Authorization Grant Response ---");
  console.log(`code: ${code}`);
  console.log(`state: ${state}`);

  if (code !== undefined && state !== undefined) 
  {
    if (req.session.state !== state) {
      console.log(`session.state ${req.session.state}`);
      
      res.statusCode = 400;
      return res.send("Authorization state is invalid");
    }

    console.log("--- Access Token Request ---");
    
    // retreive the Client ID from the App settings
    const client_id = req.app.locals.client_id;

    // retreive token_endpoint from session data
    const token_endpoint =  req.session.token_endpoint;

    // build redirect URL
    const redirect_url 
        = url.format({ protocol: req.protocol, host: req.get('host'), pathname: req.baseUrl });
    
    // ************************************
    // TODO 6. Populate the Token request body
    
    //const token_request = {}; 
    const token_request = {
      grant_type:   "authorization_code",
      code:         code,      
      client_id:    client_id,
      redirect_uri: redirect_url
    };
    
    // ************************************

    console.log(`POST ${token_endpoint}`);
    console.log(qs.stringify(token_request));

    // POST token request 
    http.post(token_endpoint, qs.stringify(token_request))
    .then(function (response) {
      const token_data = response.data;    
      
      // ********************************************************
      // TODO 7. Extract access token and launch context from token data
      //         and save in session for later

      //req.session.access_token = null;
      //req.session.id_token = null;
      //req.session.scopes = null;
      //req.session.patient = null;
      // --------------------------------------------------------
      req.session.access_token = token_data.access_token;
      req.session.id_token = token_data.id_token;
      req.session.scopes = token_data.scope;
      req.session.patient = token_data.patient;
      
      // ********************************************************
      console.log("--- Access Token Response ---");
      console.log(JSON.stringify(token_data,null,2));
      console.log("--- Redirect to App after authorization successful ---");
      
      // Redirect to app after Auth sequence successful
      return res.redirect("/");
    })
    .catch(function (error) {
      const response = error.response;
      console.log("Error: " + response.status + " " + response.statusText);
      console.log(response.data);
      // handle error
      return next(error);
    });

    // clear the state in session
    req.session.state = undefined;
    
  } 
  else
  {
    res.statusCode = 400;
    return res.send("code and state parameters required for authorize callback");
  }   
});

module.exports = router;