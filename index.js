//import express
const express = require("express");
const parse = require('parse-color');

const { createCanvas, loadImage } = require('canvas')

const axios = require("axios")

// init express
const app = express();

// basic route
app.get('/',(_,res)=>{
    res.send('medical record renderer')
})
app.get('/render/electrocardiogram',  (req, res) => {
    
        if(req.query.id == "" || req.query.id == undefined || req.query.id == null){
            res.send("Cannot find electrocardiogram!")
            return
        }
        
        axios.get(
                `https://medical-record.cexup.com/api/v1/medical-records/electrocardiogram?id=${req.query.id}`,
                {
                    headers:{
                        'x-api-key': 'MTYzNTEzMDIzNDY0MA==16351302346401637558061370',
                        'Content-Type':'application/json'
                    }
                }
            )
            .then(ress=>{
                if(ress.data.code < 300 && ress.data.code >= 200){
                    /**
                     * lead:[[0,1]]
                     * */ 
                    //console.log(ress.data.data)
                    renderECG(res,ress.data.data.leadData[0])
                }else{
                    res.send(ress.data.code)
                }
            })
            .catch(e=>{
                res.send(`${e.message}`)
            })

});

function renderECG(res,lead){

    // user data
    var username = null;
    var sex = null;
    var age = null;
    var hr = null;
    var bp = null;

    // lead data
    var leadData = [];
    var leadDataTest = lead
  

    // colors
    var mInitColor = "#000000";
    var mLineColor = "#FB3159";
    var mGridColor = "#D9D9D9";
    var mSGridColor = "#F0F0F0";
    var mSecLineColor = "#8C8C8C";

    // grid 
    var resolutionScale = 1.5; // 1 = 2700x1501
    var density = resolutionScale * 2;
    var gain = 10; // wave gain
    var mGridWidth;
    var mSGridWidth;

    // set data
    function setDatas(native_list, usernameArg, sexArg, ageArg, hrArg, bpArg) {
        if (native_list != null) {
            leadData = [];
            leadData.push(...native_list);
            username = usernameArg;
            sex = sexArg;
            age = ageArg;
            hr = hrArg;
            bp = bpArg;
        }
    }

    // set data
    setDatas(leadDataTest, username, sex, age, hr, bp);

    // timeout ms
    const DEFAULT_TIMEOUT_MS = 2500;

    // resolution
    var mWidth = resolutionScale * 2700; // width
    // var mWidth = resolutionScale * leadData.length * 3.05; // width
    var temp = 0;
    if (leadData.length * 3 % DEFAULT_TIMEOUT_MS == 0) {
        temp = leadData.length * 3 / DEFAULT_TIMEOUT_MS;
    } else {
        temp = leadData.length * 3 / DEFAULT_TIMEOUT_MS + 1
    }
    temp = parseInt((temp + 1) * 200 * resolutionScale / 1.12)
    var mHeight = temp; // height
    // var mHeight = temp / 2.5; // height

    // canvas
    const canvas = createCanvas(mWidth, mHeight)
    const ctx = canvas.getContext('2d')

    // text
    ctx.textBaseline = "bottom";

    // anti-alias
    ctx.antialias = "default"

    // draw the background and wave
    function initBackground() {
        mSGridWidth = (10 * resolutionScale);
        mGridWidth = 5 * mSGridWidth;

        var vSNum = parseInt((mWidth / mSGridWidth));
        var hSNum = parseInt((mHeight / mSGridWidth));

        ctx.strokeStyle = mSGridColor;
        ctx.lineWidth = 2;

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, mWidth, mHeight);
        ctx.fillStyle = "#000000";

        for (let index = 0; index < vSNum + 1; index++) {
            ctx.beginPath();
            ctx.moveTo(index * mSGridWidth, 0);
            ctx.lineTo(index * mSGridWidth, mHeight);
            ctx.stroke();
            ctx.closePath();
        }

        for (let index = 0; index < hSNum + 1; index++) {
            ctx.beginPath();
            ctx.moveTo(0, index * mSGridWidth);
            ctx.lineTo(mWidth, index * mSGridWidth);
            ctx.stroke();
            ctx.closePath();
        }

        var vNum = parseInt(mWidth / mGridWidth);
        var hNum = parseInt(mHeight / mGridWidth);

        ctx.strokeStyle = mGridColor;
        ctx.lineWidth = 3;

        for (let index = 0; index < hNum + 1; index++) {
            ctx.beginPath();
            if (index === 0 || index === hNum) {
                ctx.strokeStyle = mInitColor;
            } else {
                ctx.strokeStyle = mGridColor;
            }
            ctx.moveTo(0, index * mGridWidth);
            ctx.lineTo(mWidth, index * mGridWidth);
            ctx.stroke();
            ctx.closePath();
        }

        for (let index = 0; index < vNum + 1; index++) {
            ctx.beginPath();
            ctx.lineWidth = 3;
            if (index === 0 || index === vNum) {
                ctx.strokeStyle = mInitColor;
            } else {
                ctx.strokeStyle = mGridColor;
            }
            ctx.moveTo(index * mGridWidth, 0);
            ctx.lineTo(index * mGridWidth, mHeight);
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            if ((index - 2) % 5 == 0) {
                ctx.strokeStyle = mSecLineColor;
                ctx.moveTo(index * mGridWidth, 2 * mGridWidth);
                ctx.lineTo(index * mGridWidth, mHeight - 2 * mGridWidth);
                ctx.stroke();

                ctx.font = (10 * density) + "px Arial";
                ctx.fillText((index - 2) / 5 + "s", index * mGridWidth + 0.5 * mSGridWidth, mHeight - 2 * mGridWidth);
            }
            ctx.closePath();
        }

        ctx.beginPath();
        ctx.strokeStyle = mInitColor;
        ctx.lineWidth = 3;
        ctx.moveTo(0, 4 * mGridWidth);
        ctx.lineTo(2 * mSGridWidth, 4 * mGridWidth);
        ctx.lineTo(2 * mSGridWidth, 2 * mGridWidth);
        ctx.lineTo(2 * mSGridWidth + mGridWidth, 2 * mGridWidth);
        ctx.lineTo(2 * mSGridWidth + mGridWidth, 4 * mGridWidth);
        ctx.lineTo(4 * mSGridWidth + mGridWidth, 4 * mGridWidth);
        ctx.stroke();
        ctx.closePath();

        ctx.font = (12 * density) + "px Arial";
        ctx.fillText("Gain: 10mm/mv Walking speed: 25mm/s I lead", 2 * mGridWidth, mHeight - mGridWidth);
        ctx.fillText("username:" + username + "    "
            + "sex:" + sex + "    "
            + "age:" + age + "    "
            + "heart rate:" + (("0" === hr || hr == null || "-1" === hr) ? "--" : hr) + "    "
            + "blood pressure:" + ((bp == null || bp === "0/0" || bp === "0") ? "--" : bp),
            2 * mGridWidth, mGridWidth
        );

        ctx.strokeStyle = mLineColor;
        ctx.lineWidth = (1.25 * density);

        var startX = 0;
        var startY = 2 * mGridWidth;

        for (let index = 0; index < leadData.length; index++) {
            ctx.beginPath();
            switch (index) {
                case parseInt(2500 / 3):
                case parseInt(2500 * 2 / 3):
                case parseInt(2500 * 3 / 3):
                case parseInt(2500 * 4 / 3):
                case parseInt(2500 * 5 / 3):
                    startX = (index - 1) * 3 * resolutionScale;
                    startY += 4 * mGridWidth;
                    break;
                case parseInt(2500 * 6 / 3):
                    return;
                default:
                    var py1 = leadData[index - 1];
                    var py2 = leadData[index];
                    ctx.moveTo(2 * mGridWidth + (index - 1) * 3 * resolutionScale - startX, 4 * mGridWidth / 2 - py1 * gain * mSGridWidth / 1000 + startY);
                    ctx.lineTo(2 * mGridWidth + index * 3 * resolutionScale - startX, 4 * mGridWidth / 2 - py2 * gain * mSGridWidth / 1000 + startY);
                    ctx.stroke();
                    break;
            }
            // if (index > 0) {
            //     var py1 = leadData[index-1];
            //     var py2 = leadData[index];
            //     ctx.moveTo((index - 1) * 3 * resolutionScale, mHeight / 2 / mGridWidth * mGridWidth - py1 * gain * mSGridWidth / 1000);
            //     ctx.lineTo(index * 3 * resolutionScale, mHeight / 2 / mGridWidth * mGridWidth - py2 * gain * mSGridWidth / 1000);
            //     ctx.stroke();
            // }
            ctx.closePath();
        }
    }

      initBackground();

    var buffer = canvas.toBuffer();
    // var base64 = canvas.toDataURL();

    // var img = new Buffer.from(base64.split(',')[1], 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': buffer.length 
    });

   res.end(buffer); 


}

// listen on port
app.listen(3000, () => console.log('Server Running at http://localhost:3000'));