const { Promotion } = require('../models/mysql/promotion');

exports.findAll = async () => {
    const promotions = await Promotion.findAll();

    return promotions;
}