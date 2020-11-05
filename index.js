/*
 * Slack API Demo
 * This example shows how to ustilize the App Home feature
 * October 11, 2019
 *
 * This example is written in Vanilla-ish JS with Express (No Slack SDK or Framework)
 * To see how this can be written in Bolt, https://glitch.com/edit/#!/apphome-bolt-demo-note
 */

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const qs = require("qs");

const signature = require("./verifySignature");
const appHome = require("./appHome");
const message = require("./message");

const app = express();

const apiUrl = "https://slack.com/api";

const gasURL = process.env.GAS_URL;


/*
 * Parse application/x-www-form-urlencoded && application/json
 * Use body-parser's `verify` callback to export a parsed raw body
 * that you need to use to verify the signature
 *
 * Forget this if you're using Bolt framework or either SDK, otherwise you need to implement this by yourself to verify signature!
 */

const rawBodyBuffer = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || "utf8");
  }
};

app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
app.use(bodyParser.json({ verify: rawBodyBuffer }));

/*
 * Endpoint to receive events from Events API.
 */

app.post("/slack/events", async (req, res) => {
  switch (req.body.type) {
    case "url_verification": {
      // verify Events API endpoint by returning challenge if present
      res.send({ challenge: req.body.challenge });
      break;
    }

    case "event_callback": {
      // Verify the signing secret
      if (!signature.isVerified(req)) {
        res.sendStatus(404);
        return;
      }

      // Request is verified --
      else {
        const { type, user, channel, tab, text, subtype } = req.body.event;

        // Triggered when the App Home is opened by a user
        if (type === "app_home_opened") {
          // Display App Home
          appHome.displayHome(user);
        }

        /* 
         * If you want to allow user to create a note from DM, uncomment the part! 

        // Triggered when the bot gets a DM
        else if(type === 'message') {
          
          if(subtype !== 'bot_message') { 
            
            // Create a note from the text with a default color
            const timestamp = new Date();
            const data = {
              timestamp: timestamp,
              note: text,
              color: 'yellow'
            }
            await appHome.displayHome(user, data);
                                         
            // DM back to the user 
            message.send(channel, text);
          }
        }
        */
      }
      break;
    }
    default: {
      res.sendStatus(404);
    }
  }
});

/*
 * Endpoint to receive an button action from App Home UI "Add a Schedule"
 */



app.post("/slack/actions", async (req, res) => {
  // log
  //console.log(JSON.parse(req.body.payload));

  const { token, trigger_id, user, actions, type } = JSON.parse(
    req.body.payload
  );

  // Button with "add_" action_id clicked --
  if (actions && actions[0].action_id.match(/add_/)) {
    // Open a modal window with forms to be submitted by a user
    appHome.openModal(trigger_id);
  }

  // Modal forms submitted --
  else if (type === "view_submission") {
    res.send(""); // Make sure to respond to the server to avoid an error

    const ts = new Date();
    const { user, view } = JSON.parse(req.body.payload);
    
    const data = {
      user_id: user.id,
      timestamp: ts.toLocaleString(),
      start_date: view.state.values.startDate.start_date_action.selected_date,
      start_time: view.state.values.start_time.start_hour_action.selected_option.value
      + ":" + view.state.values.start_time.start_minute_action.selected_option.value,
      end_date: view.state.values.endDate.end_date_action.selected_date,
      end_time: view.state.values.end_time.end_hour_action.selected_option.value
      + ":" + view.state.values.end_time.end_minute_action.selected_option.value,
      reason : view.state.values.reason.plain_text_input_action.value,
      reason_choices: view.state.values.reason_choices.static_select_action.selected_option.value
    };
    

    
    const headers = {
      "Content-Type": "application/json",
      // Authorization: "JWT fefege..."
    };

    axios.post(
      gasURL ,
      {"user_id": data.user_id, "timestamp": data.timestamp, "start_date": data.start_date, "start_time": data.start_time, 
       "end_date": data.end_date, "end_time": data.end_time, "reason": data.reason, "reason_choices": data.reason_choices},
      {"headers": headers}
    );

/*  
    const messages = {
      'ok': 'success',
      'ng': 'error'
    };
    postToGAS(gasURL, data, messages);
*/    
    
    // log
    var log_date = new Date();
    console.log("--- User Name and ID ---");
    console.log(user.username);
    console.log(data.user_id);
    
    
    appHome.displayHome(user.id, data);
  }
});

/* Running Express server */
const server = app.listen(5000, () => {
  console.log(
    "Express web server is running on port %d in %s mode",
    server.address().port,
    app.settings.env
  );
});

app.get("/", async (req, res) => {
  res.send(
    'There is no web UI for this code sample. To view the source code, click "View Source"'
  );
});
