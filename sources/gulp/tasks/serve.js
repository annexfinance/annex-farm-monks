module.exports = function () {
  $.gulp.task("serve", function () {
    $.gulp
      .src(["./src/images/favicons/apple-icon.png"])
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
