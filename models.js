const mongoose = require('mongoose')
mongoose.connect('MONGO_URL')

const Sw = mongoose.model('Sw', {
    nowa: String,
    file_id: {
        type: String,
        unique: true,
    },
    type: String,
    caption: String,
    time: {
        type: Date,
        default: Date.now,
    },
})

const SavedNowa = mongoose.model('nowa', {
    nowa: {
        type: String,
        unique: true,
    }
})

module.exports = {
    Sw, SavedNowa
}