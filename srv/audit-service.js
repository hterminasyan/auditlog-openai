const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
const { read } = require("@sap/cds/lib");
const { OpenAI } = require("langchain/llms/openai");
const { loadSummarizationChain, RetrievalQAChain } = require("langchain/chains");
const { loadQAMapReduceChain } = require("langchain/chains");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { ChatPromptTemplate } = require("langchain/prompts");
const fs = require("fs");
const https = require("https");

module.exports = (async function () {
    const cds = require('@sap/cds');
    const { AuditLogs } = cds.entity;

    const model = new OpenAI({
        temperature: 0,
        azureOpenAIApiKey: process.env.AZURE_API_KEY,
        azureOpenAIApiVersion: "2023-05-15",
        azureOpenAIApiInstanceName: process.env.MY_INSTANCE_NAME,
        azureOpenAIApiDeploymentName: process.env.DEPLOYMENT_NAME,
    });


    // You will need to set these environment variables or edit the following values
    const endpoint = "https://"+process.env.MY_INSTANCE_NAME+".openai.azure.com/";
    const azureApiKey = process.env.AZURE_API_KEY;


    const template = "You are an AI assistant that helps security teams to identify security threats and suggest remediation.";
    const humanTemplate = "Please summarize the security threats from the provided logs";
    const chatPrompt = ChatPromptTemplate.fromMessages(
        [
          ["system", template],
          ["user", humanTemplate],
        ]
      );

    this.after('READ', AuditLogs, async (data, req) => {

        for (let each of data) {
            each.gptMessage = await runOpenAI({ prompt: each.message });
        }

    });

    //send summary via email using BTP Destination
    async function sendEmail(req, mail) {

        /*if(runLocal) {
            const payload = JSON.stringify(mail);
            const options = {
                hostname: process.env.WEBHOOK_HOST,
                port: 443,
                path: process.env.WEBHOOK_PATH,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': payload.length
                }
            }

            var req = https.request(options)
            .on("error", err => {
                console.log("Error: " + err.message);
            });

            req.write(payload);
            req.end();
        }
        else{*/
            try {
                //const { tenant } = req;
                const mailSend = await cds.connect.to("Outlook365") ;
                
                mailSend.tx(req).post("/", mail);
               /* const mails = (
                    await mailSend.send({
                        method: "POST",
                        data: mail,
                    })
                );*/
               // console.log(mails);
            } catch (error) {
                console.error(`Error: ${error?.message}`);
            }
        //}
    }

    this.on('triggerMailRefine', async (data, req) => {

        const summary = await runLangChainRefine();
        sendEmail(summary);
        return { summary }
 
     });

     this.on('triggerMailMapReduce', async (req) => {

        const summary = await runLangChainMapReduce();
        sendEmail(req, summary);
        return { summary }
 
     });


    async function runOpenAI(req) {
        const messages = [
            { role: "system", content: "You are an AI assistant that helps security teams to identify security threats and suggest remediation. Your reference to qualify the log entries is provided by SAP here: https://help.sap.com/docs/btp/sap-business-technology-platform/security-events-logged-by-cf-services" },
            { role: "user", content: "Summarize security threats from SAP BTP audit log below:" },
            { role: "user", content: req.prompt },
        ];
        const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
        const deploymentId = process.env.DEPLOYMENT_NAME;
        const textResponses = [];
        const events = await client.listChatCompletions(deploymentId, messages, { maxTokens: 128 });

        for await (const event of events) {
            for (const choice of event.choices) {
                const responseText = choice.delta?.content;
                if (responseText) {
                    textResponses.push(responseText);
                }
            }
        }

        const allText = textResponses.join('');
        return allText;
    }

    async function runLangChainRefine() {


        const text = fs.readFileSync("data.json", "utf8");
        const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
        const docs = await textSplitter.createDocuments([text]);

       
        const chain = loadSummarizationChain(model, { type: "refine" , returnIntermediateSteps: true,  questionPrompt: chatPrompt });
        const res = await chain.call({
            input_documents: docs,
        }
        );
        console.log({ res });
        return res.output_text
      
    }


    async function runLangChainMapReduce() {


        const text = fs.readFileSync("data.json", "utf8");
        const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
        const docs = await textSplitter.createDocuments([text]); 

       
        const chain = loadSummarizationChain(model, { type: "map_reduce" });
       // const mapReduceChain = loadQAMapReduceChain(model);
        const res = await chain.call({
            input_documents: docs,
        }
        );
        console.log({ res });
        return res.text
      
    }


})
