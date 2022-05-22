const express = require("express")
const app = express()
const server = require("http").Server(app)
const formidable = require('formidable')
let fs = require('fs')
const body_parser = require("body-parser")
const cors = require("cors")
const IpfsClient = require('ipfs-http-client')
const toBuffer = require('it-to-buffer')

const ipfs = IpfsClient.create({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })

require("dotenv").config()

app.use(cors())
app.use(body_parser.json())
app.use(body_parser.urlencoded({ extended: false }))

const run = async (fileName, filePath) => {
    const file = fs.readFileSync(filePath)

    const filesAdded = await ipfs.add({ path: fileName, content: file }, {})
    console.log(filesAdded)

    const fileHash = filesAdded.cid
    const fileContents = await toBuffer(ipfs.cat(fileHash))

    return [fileHash, fileContents]
}

app.post('/upload', (req, res) => {
    let form = new formidable.IncomingForm()

    form.parse(req, function (error, fields, file) {
        let filepath = file.fileupload.filepath
        let newpath = __dirname + "/uploads/"
        let unique = Date.now()
        newpath += unique + file.fileupload.originalFilename

        //Copy the uploaded file to a custom folder
        fs.rename(filepath, newpath, async function () {
            if (error) {
                res.send({ data: error, status: false, urlIpsf: "" })
                res.end()
            }

            const [fileHash, fileContents] = await run(unique + file.fileupload.originalFilename, newpath)
            console.log("File Hash received __>", fileHash)

            fs.unlink(newpath, (err) => {
                if (err) {
                    console.log("Error: Unable to delete file. ", err)
                }
            })
            // Array of mimetype Images
            const arrayImage = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/tiff']

            if (arrayImage.includes(file.fileupload.mimetype)) {
                res.send({
                    data: 'NodeJS File Upload Success!',
                    status: true,
                    image: true,
                    bufferContent: fileContents.toString(),
                    urlIpfs: `https://ipfs.io/ipfs/${fileHash}`
                })
            } else {
                res.send({
                    data: 'NodeJS File Upload Success!',
                    status: true,
                    image: false,
                    bufferContent: fileContents.toString(),
                    urlIpfs: `https://ipfs.io/ipfs/${fileHash}`
                })
            }
            res.end()
        })
    })
})

server.listen(process.env.PORT_SERVER, process.env.HOST_SERVER, () => {
    console.info(`Servidor corriendo en http://${process.env.HOST_SERVER}:${process.env.PORT_SERVER}`)
})