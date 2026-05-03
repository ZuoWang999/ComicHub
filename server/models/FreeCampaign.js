const mongoose = require('mongoose')

const FreeCampaignSchema = new mongoose.Schema({
  comic: { type: mongoose.Schema.Types.ObjectId, ref: 'Comic', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
}, { timestamps: true })

FreeCampaignSchema.index({ isActive: 1, startDate: 1 })

module.exports = mongoose.model('FreeCampaign', FreeCampaignSchema)
