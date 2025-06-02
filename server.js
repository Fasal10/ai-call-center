const express = require('express');
const twilio = require('twilio');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

const VoiceResponse = twilio.twiml.VoiceResponse;

// Simple in-memory agent pool
let agents = [
  { id: 1, name: 'Alice', phone: '+15551234567', available: true },
  { id: 2, name: 'Bob', phone: '+15557654321', available: true }
];

app.post('/incoming-call', (req, res) => {
  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    input: 'speech',
    action: '/process-input',
    method: 'POST'
  });
  gather.say('Hi! Welcome to our AI call center. Please tell me your name, age, and the reason for calling.');

  res.type('text/xml');
  res.send(twiml.toString());
});

app.post('/process-input', (req, res) => {
  const userInput = req.body.SpeechResult || 'No input';
  console.log('User said:', userInput);

  const availableAgent = agents.find(agent => agent.available);

  const twiml = new VoiceResponse();

  if (availableAgent) {
    availableAgent.available = false;
    twiml.say('Thank you! Connecting you to an available agent.');
    twiml.dial(availableAgent.phone);
  } else {
    twiml.say('All agents are currently busy. Please try again later.');
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
