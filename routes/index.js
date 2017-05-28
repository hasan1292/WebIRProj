var express = require('express');
var router = express.Router();
var mongoose =require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    url : String,
    source: String,
    title: String,
    time: String,
    words: String,
    rankScore: Number,
    totalWords: Number
});

/*
var str ="helloz world";

var res = str.split(" ");

var hell = "";
    hell = res[0];

var num = 1.2;
var num2 = Math.log(2);
var num3 = num*num2;
*/
var UserPost = mongoose.model('mycol',userSchema);

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index');
});

router.get('/check',function(req,res){

    UserPost.find({},function(err,movies){
        // UserPost.findOne({_id:a},function(err,movies){
        console.log(movies);
        res.render('index', {
            postData: movies,
            title:'kdodkodko'
        });

        mongoose.disconnect();
    });
});

router.post('/search', function(req, res){
    mongoose.connect('mongodb://localhost/test');
    var list = [];
    var str = req.body.search.toLowerCase();

    var bbc = false;
    var cnn = false;
    var cd = false;

    var news = req.body.news;

    if(str.length < 2 || news === undefined){
        res.render('searchResult', {
            title: 'CMain' ,
            name: 'Customer',
            projCon: [],
            signal : true
        });
        mongoose.disconnect();
    }
    else {

        var jamba = true;

        if(news == "BBC")
            bbc = true;
        else if(news == "CNN")
            cnn = true;
        else if(news == "CD")
            cd = true;

        else {
            news.forEach(function (item) {
                if (item == "BBC")
                    bbc = true;
                if (item == "CNN")
                    cnn = true;
                if (item == "CD")
                    cd = true;
            });
        }


        // str = str.replace("[\\\\@?^-&!#)\"(\\['\\]}{|/,.*]*", "");

        str = str.replace(/[^a-zA-Z0-9 ]/g, '');

        //console.log(str);
        var stop_words = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
            'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            'about', 'above', 'across', 'after', 'again', 'against', 'all',
            'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at', 'be', 'because',
            'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
            'cant', 'cannot', 'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt',
            'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had',
            'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed', 'hes', 'her',
            'here', 'heres', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows',
            'im', 'ive', 'if', 'in', 'into', 'is', 'isnt', 'it', 'its', 'itself', 'lets', 'me',
            'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on',
            'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over',
            'own', 'same', 'shant', 'she', 'shes', 'should', 'shouldnt', 'so', 'some', 'such',
            'than', 'that', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then',
            'there', 'theres', 'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this',
            'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasnt',
            'we', 'weve', 'were', 'werent', 'what', 'whats', 'when', 'whens', 'where', 'wheres',
            'which', 'while', 'who', 'whos', 'whom', 'why', 'whys', 'with', 'wont', 'would',
            'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve', 'your', 'yours', 'yourself',
            'yourselves'];

        var filtered = str.split(/\b/).filter(function (v) {
            return stop_words.indexOf(v) == -1;
        });

        var str2 = filtered.join('');



        var map = new Object();

        var term = str2.split(/[ ]+/);

        var terms = "";

        term.forEach(function (item) {
            if (item.length > 1) {
                if (map[item] == null) {
                    map[item] = 1;
                    terms = terms + item + ":";
                }
                else {
                    var num = map[item];
                    map[item] = num + 1;
                }
            }
        });


        terms = terms.slice(0, -1);

        var queryTerms = terms.split(':');

        var BM25 = new Array(1000);

        for (var i = 0; i < BM25.length; i++) {
            BM25[i] = 0.0;
        }

        var checknull = false;

        queryTerms.forEach(function(itemX){
           if(itemX != "")
               checknull = true;
        });


        if(checknull) {
            UserPost.find({}, function (err, docs) {
                if (err) throw err;
                else {

                    queryTerms.forEach(function (itemX) {

                        var i = 0;
                        var N = 0;
                        var n = 0;
                        var docsL = 0;
                        var avdl = 0.0;
                        var tf = 0;
                        var qtf = map[itemX];
                        var k1 = 2.0;
                        var d = 0;
                        var b = 0.75;
                        var k3 = 100.0;
                        var K = 0.0;


                        ///////Other fetch in now

                        docs.forEach(function (item) {
                            N = N + 1;
                            if (item.words.indexOf(itemX) > -1)
                                n = n + 1;
                            docsL = docsL + item.totalWords;
                        });
                        avdl = docsL / N;

                        docs.forEach(function (item2) {
                            if (item2.words.indexOf(itemX) > -1) {
                                tf = 0;
                                d = parseInt(item2.totalWords);
                                var words = item2.words.toString().split(':');
                                words.forEach(function (item3) {
                                    if (item3.indexOf(itemX) > -1) {
                                        var x = item3.split(',');
                                        if (x.length > 1) {
                                            if (tf < parseInt(x[1]))
                                                tf = parseInt(x[1]);
                                        }
                                    }
                                });
                                //taking R and r as 0.


                                var w1 = Math.log(1 / ((n + 0.5) / (N - n + 0.5)));

                                K = k1 * ((1 - b) + ((b * d) / avdl));


                                BM25[i] = BM25[i] + (w1 * (((k1 + 1) * tf) / (K + tf)) * (((k3 + 1) * qtf) / (k3 + qtf)));
                                // console.log(i+'          '+item2.title+'        '+tf);
                                //i++;
                            }

                            var check = false;

                            queryTerms.forEach(function (itemAlpha) {
                                if (item2.words.indexOf(itemAlpha) > -1)
                                    check = true;
                            });
                            if (check)
                                i++;

                        });
                    });

                    var j = 0;
                    docs.forEach(function (itemA) {
                        var check = false;


                        queryTerms.forEach(function (itemB) {
                            if (itemA.words.indexOf(itemB) > -1)
                                check = true;
                        });

                        if (check) {
                            jamba = false;
                            BM25[j] = Math.round(BM25[j] * 10000) / 10000
                            itemA.rankScore = Math.abs(BM25[j]);
                            j++;
                            if (itemA.source == "BBC" && bbc)
                                list.push(itemA);
                            else if (itemA.source == "CNN" && cnn)
                                list.push(itemA);
                            else if (itemA.source == "China Daily" && cd)
                                list.push(itemA);

                        }

                    });

                    list.sort(function (a, b) {
                        return parseFloat(b.rankScore) - parseFloat(a.rankScore);
                    });

                    res.render('searchResult', {
                        title: 'CMain',
                        name: 'Customer',
                        projCon: list,
                        signal: jamba
                    });
                    mongoose.disconnect();
                }
            });
        }else{
            res.render('searchResult', {
                title: 'CMain' ,
                name: 'Customer',
                projCon: [],
                signal : true
            });
            mongoose.disconnect();
        }
    }

});


module.exports = router;
