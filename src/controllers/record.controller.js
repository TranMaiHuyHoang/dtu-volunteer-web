import recordService from '../services/record.service.js';

const createRecord = async (req, res, next) => {
	try {
		const created = await recordService.createRecord(req.body);
		res.status(201).json({ status: "success", message: 'Tạo hồ sơ thành công', data: created });
	} catch (err) { next(err); }
};

const listRecords = async (req, res, next) => {
	try {
		const { q, page = 1, limit = 20 } = req.query;
		const result = await recordService.listRecords({ q, page, limit });
		res.json(result);
	} catch (err) { next(err); }
};

const getRecord = async (req, res, next) => {
	try {
		const item = await recordService.getRecordById(req.params.id);
		res.json(item);
	} catch (err) { next(err); }
};


const updateRecord = async (req, res, next) => {
	try {
		const updated = await recordService.updateRecord(req.params.id, req.body);
		res.json({ status: "success", message: 'Cập nhật hồ sơ thành công..', data: updated });
	} catch (err) { next(err); }
};

const deleteRecord = async (req, res, next) => {
	try {
		await recordService.deleteRecord(req.params.id);
		res.json({ message: 'Xóa hồ sơ thành công' });
	} catch (err) { next(err); }
};

export {
	createRecord,
	listRecords,
	getRecord,
	updateRecord,
	deleteRecord
};


