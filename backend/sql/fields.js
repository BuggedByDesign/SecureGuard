module.exports = {
  reviewFields: `
    R.ReviewID, 
    R.ReviewText, 
    R.Rating, 
    R.ProductID, 
    U.FullName AS UserName
  `,
  productFields: `
    p.ProductID,
    p.ProductName,
    p.Description,
    p.ImageURL,
    p.Price,
    p.Discount,
    p.KeyFeatures
  `,
  userFields: `
    UserID, FullName, Email, IsOnline, IsAdmin
  `,
};
