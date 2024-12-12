const { uuidv7 } = require("uuidv7");

class GenericService {
    constructor(model) {
        this.Model = model;
    }

    async getAll(req, res) {
        const { page: reqPage, limit: reqLimit, startDate, endDate, ...filters } = req.query;
        const page = parseInt(reqPage) || 1;
        const limit = parseInt(reqLimit) || 10;
        const offset = (page - 1) * limit;

        if (startDate) {
            filters.startTime = { ...filters.startTime, $gte: new Date(startDate) };
        }
        if (endDate) {
            filters.startTime = { ...filters.startTime, $lte: new Date(endDate) };
        }

        try {
            const models = await this.Model.find(filters)
                .skip(offset)
                .limit(limit);

            const countTotal = await this.Model.countDocuments(filters);
            res.set('X-Total-Count', countTotal);
            return res.status(200).json(models);
        } catch (error) {
            console.error("Une erreur s'est produite :", error);
            return res.status(500).json({ error: "Erreur interne du serveur" });
        }
    }

    async getById(req, res) {
        const id = req.params.id;
        try {
            const model = await this.Model.findById(id);
            if (model) return res.status(200).json(model);
            return res.sendStatus(404);
        } catch (error) {
            console.error("Une erreur s'est produite :", error);
            return res.status(500).json({ error: "Erreur interne du serveur" });
        }
    }

    async create(req, res, next) {
        try {
            const model = new this.Model({ ...req.body });
            await model.save();
            return res.status(201).json(model);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const id = req.params.id;
            const updatedItem = await this.Model.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
            if (updatedItem) {
                return res.status(200).json(updatedItem);
            } else {
                return res.sendStatus(404);
            }
        } catch (error) {
            next(error);
        }
    }

    async patch(req, res, next) {
        try {
            const id = req.params.id;
            const updatedItem = await this.Model.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
            if (updatedItem) {
                return res.status(200).json(updatedItem);
            } else {
                return res.sendStatus(404);
            }
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res) {
        const id = req.params.id;
        try {
            const result = await this.Model.findByIdAndDelete(id);
            if (result) return res.sendStatus(204);
            return res.sendStatus(404);
        } catch (error) {
            console.error("Une erreur s'est produite :", error);
            return res.status(500).json({ error: "Erreur interne du serveur" });
        }
    }
}

module.exports = GenericService;