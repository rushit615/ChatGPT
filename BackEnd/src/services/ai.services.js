const {GoogleGenAI} = require("@google/genai")

const ai = new GoogleGenAI({});

async function generateResponse(content) {

  console.log(content)

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: content,
  }) 
  
  console.log(response.text);
  return response.text;
}

async function generateVectors(content){

  const vectors = await ai.models.embedContent({
    model:'gemini-embedding-001',
    contents:content,
    config:{
      outputDimensionality:768
    }
  })

  return vectors.embeddings[0].values
}

module.exports = {
  generateResponse,
  generateVectors
}