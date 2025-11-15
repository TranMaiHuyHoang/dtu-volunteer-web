import Record from '../models/record.model.js';
import { BadRequestError, NotFoundError, ConflictError } from '../errors/customError.js';

const buildSearchFilter = (q) => {
	if (!q) return {};
	const regex = { $regex: q, $options: 'i' };
	return {
		$or: [
			{ name: regex },
			{ email: regex },
			{ phone: regex },
			{ address: regex },
			{ notes: regex }
		]
	};
};

const createRecord = async (data) => {
	if (!data?.name || !data?.email) {
		throw new BadRequestError('Vui lòng nhập đầy đủ name và email');
	}
	const existed = await Record.findOne({ email: data.email.toLowerCase().trim() });
	if (existed) {
		throw new ConflictError('Email đã tồn tại');
	}
	const record = await Record.create(data);
	return record;
};

const listRecords = async ({ q, page = 1, limit = 20 }) => {
	const filter = buildSearchFilter(q);
	const skip = (Number(page) - 1) * Number(limit);
	const [items, total] = await Promise.all([
		Record.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
		Record.countDocuments(filter)
	]);
	return {
		items,
		page: Number(page),
		limit: Number(limit),
		total,
		pages: Math.ceil(total / Number(limit)) || 1
	};
};

const getRecordById = async (id) => {
	const record = await Record.findById(id);
	if (!record) throw new NotFoundError('Không tìm thấy hồ sơ');
	return record;
};

const updateRecord = async (id, data) => {
	const record = await Record.findById(id);
	if (!record) throw new NotFoundError('Không tìm thấy hồ sơ');

	if (data?.email && data.email !== record.email) {
		const duplicated = await Record.findOne({ email: data.email.toLowerCase().trim(), _id: { $ne: id } });
		if (duplicated) throw new ConflictError('Email đã tồn tại');
	}
	Object.assign(record, data);
	await record.save();
	return record;
};

const deleteRecord = async (id) => {
	const record = await Record.findById(id);
	if (!record) throw new NotFoundError('Không tìm thấy hồ sơ');
	await record.deleteOne();
	return { id };
};

export default {
	createRecord,
	listRecords,
	getRecordById,
	updateRecord,
	deleteRecord
};


