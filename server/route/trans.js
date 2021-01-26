module.exports = {
  '/': async (req, res) => {
    res.redirect(req.query['_']);
  }
}