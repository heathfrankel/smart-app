const express = require('express');
const router = express.Router();
const http = require('axios');
const url = require('url');

/* GET home page. */
router.get('/', function(req, res, next) {
  const session = req.session;
  
  // retreive fhir_base_url from session data
  const fhir_base_url =  session.fhir_base_url;
  // retreive patient from session data
  const patient =  session.patient;
  
  //const patient_read = fhir_base_url 
  const patient_read_url = url.parse(fhir_base_url);
  patient_read_url.pathname = patient_read_url.pathname + "/Patient/" + patient;
  const patient_read = url.format(patient_read_url);
  console.log("--- Patient Read ---")
  console.log(`GET ${patient_read}`);
  
  const req_config = { headers: {
    'Authorization': "Bearer " + session.access_token, 
    'Accept': 'application/json' 
  }}
  
  http.get(patient_read, req_config)
  .then(function (response) {
    
    const patientObj = response.data;
    
    console.log("--- Patient Response ---")
    //console.log(JSON.stringify(patientObj, null, 2));
    console.log(JSON.stringify(patientObj));

    return res.render('index', { title: 'SMART Launch App', patientObj});
  })
  .catch(function (error) {
    // handle error
    console.log(error);
    next(error);
  });
});

module.exports = router;
