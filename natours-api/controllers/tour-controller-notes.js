// const fs = require('fs');
const Tour = require('../models/tour-model');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // BUILD QUERY
    // 1a) Filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);
    // const { page, sort, limit, fields, ...queryObj } = req.query;

    // 1b) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // this will return a query object that'll have all the Query methods we need to in order to be able to use the methods below i.e where(), equal(), so we can sort, do pagination etc. Without the await keyword, the query wo't be sent to the DB and only a query object will be returned instead of the documents that meet the query criteria
    // let query = Tour.find(JSON.parse(queryStr));
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    // 2) Sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // default sorting value. -createdAt will be in descending order because of the minus sign
      this.query = this.query.sort('name');
    }

    return this;
  }

  // 3) Field Limiting
  // for a client, it's always ideal for a client to receive as little data as possible in order to reduce bandwidth that's consumed with each request
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query.select(fields);
    } else {
      // the minus sign will remove the __v field from the data being returned
      this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit; // all the results before the page we're requesting
    // skip() is the amount of results that are skipped before querying the data
    // limit() is the amount of results we want returned
    // page 1 -> 1-10, page 2 -> 11-20, page 3 -> 21-30
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

exports.getAllTours = async (req, res) => {
  try {
    // console.log(req.query);
    // // BUILD QUERY
    // // 1a) Filtering
    // const queryObj = { ...req.query };
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach((field) => delete queryObj[field]);
    // // const { page, sort, limit, fields, ...queryObj } = req.query;

    // // 1b) Advanced Filtering
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // // this will return a query object that'll have all the Query methods we need to in order to be able to use the methods below i.e where(), equal(), so we can sort, do pagination etc. Without the await keyword, the query wo't be sent to the DB and only a query object will be returned instead of the documents that meet the query criteria
    // let query = Tour.find(JSON.parse(queryStr));

    // using mongoose methods
    // const query = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    // // 2) Sorting
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   query = query.sort(sortBy);
    // } else {
    //   // default sorting value. -createdAt will be in descending order because of the minus sign
    //   query = query.sort('name');
    // }

    // // 3) Field Limiting
    // // for a client, it's always ideal for a client to receive as little data as possible in order to reduce bandwidth that's consumed with each request
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   query.select(fields);
    // } else {
    //   // the minus sign will remove the __v field from the data being returned
    //   query.select('-__v');
    // }

    // 4) Pagination
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit; // all the results before the page we're requesting
    // // skip() is the amount of results that are skipped before querying the data
    // // limit() is the amount of results we want returned
    // // page 1 -> 1-10, page 2 -> 11-20, page 3 -> 21-30
    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const numOfTours = await Tour.countDocuments();
    //   if (skip >= numOfTours) throw new Error('This page does not exist'); // throwing an error will automatically trigger the catch block and send back a 404
    // }

    // EXECUTE QUERY -
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // since we use await here, the returned value will be the documents from the DB, which wouldn't have the Query methods on them

    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    // the mongoose method findById() is short hand for using Tour.findOne({_id: req.params.id})
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  // using.save() calls the method on the document
  // const newTour = new Tour({});
  // newTour.save();
  try {
    // using Tour.create() calls create() on the Tour model itself
    // newTour will be a newly created document with an id all the data from req.body, which is name, rating, and price
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
