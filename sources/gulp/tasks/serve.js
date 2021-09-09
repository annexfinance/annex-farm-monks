module.exports = function () {
  $.gulp.task("serve", function () {
    $.gulp
      .src(["./src/pdf/Whitepaper.pdf", "./src/Swipechain.pdf"])
      .pipe($.gulp.dest($.path.dest))
      .pipe(
        $.debug({
          title: "static doc",
        })
      );
    return new Promise((res, rej) => {
      $.browsersync.init({
        server: "./" + $.path.dest,
        tunnel: false,
        port: 9000,
      });
      res();
    });
  });
};
