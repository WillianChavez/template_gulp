//comons
import gulp, { dest, watch } from 'gulp'

//babel js transpilador, terser lo ofusca y concat los une
import babel from 'gulp-babel'
import terser from 'gulp-terser'
import concat from 'gulp-concat'


//pug
import pug from 'gulp-pug'

//css 
import autoprefixer from 'autoprefixer'
import postcss from 'gulp-postcss'
import cssnano from 'cssnano'

//sass preprocesador
import sass from 'gulp-sass'
import { init as server, stream, reload } from 'browser-sync'


//imagemin comprime las imgaenes
import imagemin from 'gulp-imagemin'

//clean limpia todas las clases css que no utilizamos
import purgecss from 'gulp-purgecss'

//plumber lanza un error si halgo falla pero no detiene la app
import plumber from 'gulp-plumber'

//le agrega numeros a los links y scripts para que el navegador limpie la cache y recarge el nuevo archivo
import cacheBust from 'gulp-cache-bust'

const production = true
const pluginsCSS = [cssnano(), autoprefixer()]

gulp.task('babel', () => {
    return gulp
        .src('./src/js/*.js')
        .pipe(plumber())
        .pipe(concat('scripts-min.js'))
        .pipe(babel())
        .pipe(terser())
        .pipe(dest('./public/js'))

})

gulp.task('pug', () => {
    return gulp
        .src('./src/views/pages/*.pug')
        .pipe(plumber())
        .pipe(pug({
            pretty: production
        }))
        .pipe(cacheBust({
            type: 'timestamp'
        }))
        .pipe(dest('./public'))
})

gulp.task('sass', () => {
    return gulp
        .src('./src/sass/*.scss')
        .pipe(plumber())
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(postcss(pluginsCSS))
        .pipe(dest('./public/css'))
        .pipe(stream())
})

//ejecutar tarea de ultimo 
gulp.task('clean', () => {
        return gulp
            .src('./public/css/styles.css')
            .pipe(plumber())
            .pipe(purgecss({
                content: ['./public/*.html'],

            }))
            .pipe(
                (gulp.dest('./public/css'))
            )
    })
    //ejecutar tarea de ultimo
gulp.task('imgmin', () => {
    return gulp
        .src('./src/img/*')
        .pipe(plumber())
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(dest('./public/img'))
})

gulp.task('default', () => {
    server({
        server: './public'
    })
    watch('./src/views/**/*.pug', gulp.series('pug')).on('change', reload)
    watch('./src/sass/*.scss', gulp.series('sass')).on('change', reload)
    watch('./src/js/*.js', gulp.series('babel')).on('change', reload)
})