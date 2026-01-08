import mongoose from "mongoose";


export const UserSchema = new mongoose.Schema({
    username: String,
    role: {
        type: String,
        enum: ['ADMIN', 'USER'],
        default: 'user'
    },
    password: String
});

UserSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret, options)  {
        delete ret._id;
    }
});