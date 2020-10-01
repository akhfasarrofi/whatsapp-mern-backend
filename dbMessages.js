import mongoose from 'mongoose'

/* membuat schema mongodb */
const whatsappSchema = mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    received: Boolean,
})

export default mongoose.model('messagecontents', whatsappSchema)