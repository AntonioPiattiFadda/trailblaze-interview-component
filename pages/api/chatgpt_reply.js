import axios from "axios";

export default async function handler(req, res) {
  const { speech } = req.body;
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_PROD_URL}/chatgpt_reply`,
      {
        params: { user_input: speech },
      }
    );
    // Return the response to the client
    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
}
