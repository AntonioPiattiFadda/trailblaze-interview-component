import axios from "axios";
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

export default async function handler(req, res) {
  const { responseText } = req.body;
  
  const name = 'projects/interviewai-pro/secrets/GOOGLE_VOICE_API_KEY/versions/latest';
    
  // Access the secret version to get the payload
  const [version] = await client.accessSecretVersion({name});
  
  // Extract the payload as a string
  const apiKey = version.payload.data.toString('utf8');

  try {
    const response = await axios.post(
      "https://texttospeech.googleapis.com/v1/text:synthesize",
      {
        input: { text: responseText },
        voice: {
          languageCode: "en-US",
          name: "en-US-Journey-F",
          ssmlGender: "FEMALE",
        },
        audioConfig: { audioEncoding: "MP3" },
      },
      {
        params: { key: apiKey },
      }
    );
    if (response.data.audioContent) {
      console.log("Synthesized speech received.");
      // Convert the audioContent (which is in base64) to a Buffer
      const audioBuffer = Buffer.from(response.data.audioContent, 'base64');
      res.setHeader("Content-Type", "audio/mpeg");
      res.status(200).send(audioBuffer);
    } else {
      console.log("No audio content received.");
      res.status(400).json({ error: "No audio content received." });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}


// MOVING THIS TO BACKEND?
// import axios from "axios";

// export default async function handler(req, res) {
//   const { responseText } = req.body;
//   try {
//     const response = await axios.post(
//       `${process.env.NEXT_PUBLIC_PROD_URL}/synthesize_speech`,
//       {
//         input: { text: responseText }
//       },
//       {
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//     // Return the response to the client

//     res.status(200).send(response.data);
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json({ error: error.toString() });
//   }
// }
