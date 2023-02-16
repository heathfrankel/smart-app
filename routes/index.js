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

  if (fhir_base_url !== undefined) {
    // build Patient Read URL
    const patient_read_url = url.parse(fhir_base_url);
    patient_read_url.pathname = patient_read_url.pathname + "/Patient/" + patient;
    const patient_read = url.format(patient_read_url);
    
    // retreive access_token from session data
    const access_token =  session.access_token;
    
    // ********************************************
    // TODO: 8. Include Authorization Bearer header 

    const req_config = { 
      headers: {
        'Accept': 'application/json' 
      }
    }
    
    // ********************************************

    console.log("--- Patient Read ---")
    console.log(`GET ${patient_read}`);

    // Patient Read Request
    http.get(patient_read, req_config)
    .then(function (response) {
      // retreive Patient resource from response data
      const patientObj = response.data;
      
      console.log("--- Patient Response ---")
      console.log(JSON.stringify(patientObj));

      // render Patient resource
      return res.render('index', { title: 'SMART Launch App', patientObj });
    })
    .catch(function (error) {
      // handle error
      console.log(error);
      next(error);
    });
  }
  else {
    return res.render('index', { title: 'SMART Launch App' });
  }
});

module.exports = router;
