import Collection from "../models/collection.schema";
import asyncHandler from "../service/asyncHandler";
import CustomError from "../utils/customError";

/***************************************************************
@CREATE_COLLECTION
@route http://localhost:4000/api/collection
@description Controller for creating a new collection
@parameters name
@return Collection Object
***************************************************************/
export const createCollection = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new CustomError("Name is required", 400);
  }

  // if name is given, create a collection
  const collection = await Collection.create({
    name: name,
  });

  // send the newly created collection to frontend
  res.status(200).json({
    success: true,
    message: "Collection created successfully",
    collection,
  });
});

/***************************************************************
@GET_COLLECTIONS
@route http://localhost:4000/api/collection/all
@description Controller for getting all the collections
@parameters 
@return Collections Object
***************************************************************/
export const getAllCollections = asyncHandler(async (req, res) => {
  // no parameters passed in .find() returns all the documents
  const collections = await Collection.find();

  if (!collections) {
    throw new CustomError("No collections found", 400);
  }

  res.status(200).json({
    success: true,
    collections,
  });
});

/***************************************************************
 @UPDATE_COLLECTION
 @route http://localhost:4000/api/collection/update/:id
 @description Controller for updating a collection
 @parameters collectionId (param), name
 @return updated collection object
 ***************************************************************/
export const updateCollection = asyncHandler(async (req, res) => {
  // { sourceProperty: targetVariable }
  const { id: collectionId } = req.params;

  const { name } = req.body;

  if (!name) {
    throw new CustomError("Collection name is required", 400);
  }

  //  you need to explicitly set the 'new:' option to true to get the new version of the doc, after the update is applied:
  //   Schema Validators do not work on findByIdAndUpdate, we need to explicitly mention 'runValidators: true'
  const updatedCollection = await Collection.findByIdAndUpdate(collectionId, { name: name }, { new: true, runValidators: true });

  if (!updatedCollection) {
    throw new CustomError("Collection not found", 400);
  }

  res.status(200).json({
    success: true,
    message: "Collection updated successfully",
    updatedCollection,
  });
});

/***************************************************************
 @DELETE_COLLECTION
 @route http://localhost:4000/api/collection/delete/:id
 @description Controller for deleting a collection
 @parameters collectionId (param)
 @return deleted collection object
 ***************************************************************/

export const deleteCollection = asyncHandler(async (req, res) => {
  const { id: collectionId } = req.params;

  const deletedCollection = await Collection.findByIdAndDelete({ collectionId });

  if (!deletedCollection) {
    throw new CustomError("Collection not found", 400);
  }

  res.status(200).json({
    success: true,
    message: "Collection deleted successfully",
    deletedCollection,
  });
});
