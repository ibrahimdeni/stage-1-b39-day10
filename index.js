
const express = require('express')

const app = express()
const port = 8000

app.set('view engine', 'hbs')//set view engine hbs
app.use('/assets', express.static(__dirname + '/assets'))//biar bisa baca path folder assets
app.use(express.urlencoded({extended: false}))

const db = require('./connection/db')

let isLogin = false

app.get('/home', function(request,response){

    db.connect(function(err, client, done){
        if (err) throw err //untuk menampilkan error koneksi antara database dan nodejs

        client.query('SELECT * FROM tb_projects ORDER BY id DESC', function(err, result){
            if (err) throw err //untuk menampilkan error dari query database

            // console.log(result.rows);
            let data = result.rows

            let dataP = data.map(function(isi){
            isi.technologies = isi.technologies.map(function(tekno) {
                if (tekno != 'undefined') {
                    return tekno
                } else {
                    tekno = undefined
                }
            })    

                return {
                    ...isi,
                    isLogin,
                    start_date: getFullTime(isi.start_date),
                    end_date: getFullTime(isi.end_date),
                    duration: getDistanceTime(new Date(isi.start_date), new Date(isi.end_date))
                }
            })
            console.log(dataP);
            response.render("home", {isLogin, dataProject: dataP})
            
        })

    })

})

app.get('/project-detail/:id', function(request,response){

    let id = request.params.id

    db.connect(function(err, client, done){
        if (err) throw err //untuk menampilkan error koneksi antara database dan nodejs

        let query = `SELECT * FROM tb_projects WHERE id=${id}`

        client.query(query, function(err, result){
            if (err) throw err //untuk menampilkan error dari query database

            let data = result.rows
            // console.log(data);

            let dataP = data.map(function(isi){
            isi.technologies = isi.technologies.map(function(tekno) {
                if (tekno != 'undefined') {
                    return tekno
                } else {
                    tekno = undefined
                }
            })

                return {
                    ...isi,
                    isLogin,
                    start_date: getFullTime(isi.start_date),
                    end_date: getFullTime(isi.end_date),
                    duration: getDistanceTime(new Date(isi.start_date), new Date(isi.end_date))
                }
              
                
            })
            console.log(dataP);
            response.render("project-detail", {data : dataP[0]})
        })

    })

})

//untuk menampilkan halaman
app.get('/add-project', function(request,response){ 
    response.render("add-project")
})

// untuk mengambil data dari add-project
app.post('/add-project', function(request,response){

    let name = request.body.inputProject
    let start_date = request.body.inputStartDate
    let end_date = request.body.inputEndDate
    let description = request.body.inputDescription
    let nodeJs = request.body.inputNOJ
    let reactJs = request.body.inputREJ
    let nextJs = request.body.inputNEJ
    let java = request.body.inputJAV
    let image = request.body.inputImage
    // console.log(`koplak : `,nodeJs);

    //cara penulisan lain(biasa di gunakan programmer)
    // let {inputProject: name,
    //     inputStartDate: start_date,
    //     inputEndDate: end_date,
    //     inputDescription: description,
    //     nodeJs : inputNOJ,
    //     reactJs : inputREJ,
    //     nextJs : inputNEJ,
    //     java : inputJAV,
    //     inputImage: image} = request.body

        // console.log(request.body.inputNOJ);

        db.connect(function(err, client, done){
            if (err) throw err //untuk menampilkan error koneksi antara database dan nodejs
    
            let query = `INSERT INTO tb_projects (name, start_date, end_date, description, technologies, image) VALUES 
                            ('${name}','${start_date}','${end_date}','${description}','{"${nodeJs}","${reactJs}","${nextJs}","${java}"}','images.jpg')`
    
            client.query(query, function(err, result){
                if (err) throw err //untuk menampilkan error dari query database
    
                let data = result.rows
                console.log(data);
    
                let dataP = data.map(function(isi){
                    return {
                        ...isi,
                        isLogin,
                        start_date: getFullTime(isi.start_date),
                        end_date: getFullTime(isi.end_date),
                        duration: getDistanceTime(new Date(isi.start_date), new Date(isi.end_date))
                    }
                })

                response.redirect('/home')

            })
    
        })

})

//get ke hal edit blog untuk input data baru
app.get('/edit-project/:idParams', function(request,response){ 
    let id = request.params.idParams
    db.connect(function(err, client, done){
        if (err) throw err //untuk menampilkan error koneksi antara database dan nodejs

        let query = `SELECT * FROM tb_projects WHERE id=${id}`

        client.query(query, function(err, result){
            if (err) throw err //untuk menampilkan error dari query database

            let data = result.rows
            let start_date = getStart(data[0].start_date)
            let end_date = getStart(data[0].end_date)

            response.render("edit-project", { data: data[0], start_date, end_date })
        })

    })

})

//untuk post hasil edit ke hal home
app.post('/edit-project/:idParams', function(request,response){ 

    let name = request.body.inputProject
    let start_date = request.body.inputStartDate
    let end_date = request.body.inputEndDate
    let description = request.body.inputDescription
    let nodeJs = request.body.inputNOJ
    let reactJs = request.body.inputREJ
    let nextJs = request.body.inputNEJ
    let java = request.body.inputJAV
    let image = request.body.inputImage
    let id = request.params.idParams

    db.connect(function(err, client, done){
        if (err) throw err //untuk menampilkan error koneksi antara database dan nodejs

        let query =`UPDATE tb_projects 
                    SET name='${name}',
                        start_date='${start_date}',
                        end_date='${end_date}',
                        description='${description}',
                        technologies='{"${nodeJs}","${reactJs}","${nextJs}","${java}"}' WHERE id=${id}`

        client.query(query, function(err, result){
            if (err) throw err //untuk menampilkan error dari query database

            let data = result.rows
            console.log(data);

            let dataP = data.map(function(isi){
                return {
                    ...isi,
                    isLogin,
                    start_date: getFullTime(isi.start_date),
                    end_date: getFullTime(isi.end_date),
                    duration: getDistanceTime(new Date(isi.start_date), new Date(isi.end_date))
                }
            })

            response.redirect('/home')

        })

    })


})

//untuk hapus project
app.get('/delete-project/:idParams', function(request, response) {

    let id = request.params.idParams

    db.connect(function(err, client, done){
        if (err) throw err //untuk menampilkan error koneksi antara database dan nodejs

        let query = `DELETE FROM tb_projects WHERE id=${id}`

        client.query(query, function(err, result){
            if (err) throw err //untuk menampilkan error dari query database

            let data = result.rows
            console.log(data);

            let dataP = data.map(function(isi){
                return {
                    ...isi,
                    isLogin,
                    start_date: getFullTime(isi.start_date),
                    end_date: getFullTime(isi.end_date),
                    duration: getDistanceTime(new Date(isi.start_date), new Date(isi.end_date))
                }
            })

            response.redirect('/home')

        })

    })

})

function getFullTime(time){

    let month = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"]

    let date = time.getDate()
    let monthIndex = time.getMonth()
    let year = time.getFullYear()

    let hours = time.getHours()
    let minutes = time.getMinutes()

    // console.log(date);
    // console.log(month[monthIndex]);
    // console.log(year);

    // console.log(hours);
    // console.log(minutes);

    // if(hours < 10){
    //     hours = "0" + hours
    // }else if(minutes < 10){
    //     minutes = "0" + minutes
    // }
    
    // 12 Agustus 2022 09.04
    let fullTime = `${date} ${month[monthIndex]} ${year}`
    // console.log(fullTime);
    return fullTime
}

function getDistanceTime(startd, endd){
    let mulai = new Date(startd)
    let akhir = new Date(endd)

    let duration = akhir - mulai
    
    //miliseconds  1000 = 1 detik
    //second in hours 3600 
    // hours in day 23 (karena ketika sudah sampai jam 23.59 akan kembali ke 00.00)
    // day in month 31

    let distanceDay = Math.floor(duration / (1000 * 3600 * 23));
    let distanceMonth = Math.floor(distanceDay / 31);

    
    if (distanceMonth <= 0) {
        return distanceDay + " Hari"
    } else 
        return distanceMonth + " Bulan "
    
}

function getStart(start) {
    let d = new Date(start),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

    if (month.length < 2) {
        month = '0' + month
    } 

    if (day.length < 2) {
        day = '0' + day
    }

    return [year, month, day].join('-')

}

app.get('/contact', function(request,response){
    response.render("contact")
})


app.listen(port, function(){
    console.log(`server running on port ${port}`);
} 
)