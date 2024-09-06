import axios from "axios";

export default async function handler(req, res) {
  const { combinedQA } = req.body;
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_PROD_URL}/submit_answer`,
      {
        combinedQA: combinedQA,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    // Return the response to the client

    res.status(200).send(response.data);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.toString() });
  }
}
