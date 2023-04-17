import {canvasProp, beach, dune, sea, tide, maxWave, preventions, seaBees, housesArr, house, seaWalls} from './object_assets.js';

// Gets the client's (user) canvas dimensions to set within our canvasProp
canvasProp.setCanvasHeight = document.getElementById('canvas').getBoundingClientRect().height;
canvasProp.setCanvasWidth = document.getElementById('canvas').getBoundingClientRect().width;


// Setups up initial canvas as svg to draw on.
// Then calls drawSideCanvas to draw the side view initially
var canvas = d3.select("#canvas")
    .append("svg")
    .attr("width", canvasProp.getCanvasWidth)
    .attr("height", canvasProp.getCanvasHeight);

// Creating predefined houses - first row
var j = 0.01
for (var i = 0; i < 8; i++) {
    const houseT = Object.create(house)
    houseT.createNew(0.33, 0.07, 0.09, ((i * 0.13) + j), 50000)
    housesArr.getHouses.push(houseT)
}
// Creating predefined houses - second row
for (var i = 0; i < 8; i++) {
    const houseT = Object.create(house)
    houseT.createNew(0.33, 0.07, 0.09, ((i * 0.13) + j), 40000)
    housesArr.getHouses.push(houseT)
}

drawSideCanvas(canvas)
document.getElementById("currYear").innerHTML = 2023;
document.getElementById("budgetRem").innerHTML = preventions.getBudget.toLocaleString();
document.getElementById("purchaseAmountTot").innerHTML = 0;


// *************************** Main Draw Functions **********************************

// Draws the side view of the canvas
function drawSideCanvas(canvas) {
    canvas.selectAll("*").remove();
    console.log("Drawing the Side")
    var tideOption = setSelectedTide();
    setSelectWaveHeight()
    canvas = drawBackground(canvas)
    canvas = drawSideSea(canvas)
    if (canvasProp.getStateWaves == 1) {canvas = drawSideMaxWave(canvas)}
    canvas = drawSideTide(canvas);
    canvas = drawSidePreventions(canvas)
    canvas = drawSideBeach(canvas)
    canvas = drawSideDune(canvas)
    canvas = drawSideHouse(canvas)
    canvas = drawBorder(canvas)
    if (canvasProp.getStateDim == 1) {canvas = drawRealDimLabels(canvas, canvasProp.getRealLength, canvasProp.getRealHeight)}
    return canvas
}

// Draws the side view of the canvas
function drawAerialCanvas(canvas) {
    canvas.selectAll("*").remove();
    console.log("Drawing the aerial")
    var tideOption = setSelectedTide();
    setSelectWaveHeight()
    canvas = drawBackground(canvas)
    canvas = drawAerialBeach(canvas)
    canvas = drawAerialDune(canvas)
    canvas = drawAerialSea(canvas)
    if (tideOption != 1) { canvas = drawAerialTide(canvas);}
    if (canvasProp.getStateWaves == 1) {canvas = drawAerialWave(canvas)}
    canvas = drawAerialPreventions(canvas)
    canvas = drawAerialHouses(canvas)
    canvas = drawBorder(canvas)
    if (canvasProp.getStateDim == 1) {canvas = drawRealDimLabels(canvas, canvasProp.getRealWidth, canvasProp.getRealLength)}
    return canvas
}

// Draws the background colour of the canvas
function drawBackground(canvas) {
    canvas.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", canvasProp.getCanvasWidth)
      .attr("height", canvasProp.getCanvasHeight)
      .style("fill", "#E8E8E8");
    return canvas
}

function drawBorder(canvas) {
    const cH = canvasProp.getCanvasHeight
    const cW = canvasProp.getCanvasWidth
    var line = [
        {"x": 0, "y": 0},
        {"x": cW, "y": 0},
        {"x": cW, "y": cH},
        {"x": 0, "y": cH},
        {"x": 0, "y": 0}
    ];
    
    var lineFunction = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });
    
    canvas.append("path")
        .attr("d", lineFunction(line))
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .attr("fill", "black")
        .attr("fill-opacity", "0%");

    return canvas
}

// *************************** User Input Change Functions **********************************

const sideViewOption = document.getElementById('sideViewButton');
sideViewOption.addEventListener('click', reDrawSideCanvas);
function reDrawSideCanvas() {
    document.getElementById("aerialViewButton").classList.remove("active")
    canvasProp.setState = 0
    drawSideCanvas(canvas)
}

const aerialViewOption = document.getElementById('aerialViewButton');
aerialViewOption.addEventListener('click', reDrawAerialCanvas);
function reDrawAerialCanvas() {
    document.getElementById("sideViewButton").classList.remove("active")
    canvasProp.setState = 1
    drawAerialCanvas(canvas)
}

// detects change in showing and hiding dimensions
const dimensionsOption = document.getElementById('sHDimensionsB');
dimensionsOption.addEventListener('click', userDimensions);
function userDimensions() {
    if (canvasProp.getStateDim == 0) {
        canvasProp.setStateDim = 1
        document.getElementById("sHDimensionsB").innerHTML = "Hide Dimensions";
        sHDimensionsB.classList.add("active");
        sHDimensionsB.classList.remove("active");
    } else {
        canvasProp.setStateDim = 0
        document.getElementById("sHDimensionsB").innerHTML = "Show Dimensions";
        sHDimensionsB.classList.add("active");
    }
    if (canvasProp.getState == 0) {drawSideCanvas(canvas)} else {drawAerialCanvas(canvas)}
}

const wavesButton = document.getElementById('sHWavesB');
wavesButton.addEventListener('click', userWaves);
function userWaves() {
    if (canvasProp.getStateWaves == 0) {
        canvasProp.setStateWaves = 1
        document.getElementById("sHWavesB").innerHTML = "Hide Waves";
        sHWavesB.classList.add("active");
    } else {
        canvasProp.setStateWaves = 0
        document.getElementById("sHWavesB").innerHTML = "Show Waves";
        sHWavesB.classList.remove("active");
    }
    if (canvasProp.getState == 0) {drawSideCanvas(canvas)} else {drawAerialCanvas(canvas)}
}

var timeSlider = d3.select("#timeSlider");
timeSlider.on("input", function() {
    if (this.value > canvasProp.getYear) {
        incrementYear();
        if (canvasProp.getYear == 77) {
            canvasProp.setSimFinished = true;
            winDetection()
        }
    }
});

var waveSlider = d3.select("#maxWaveHeightSlider");
waveSlider.on("input", function() {
    // maxWave.setHeight = this.value / 2; // divided by two to get avg sea height to peak of wave
    if (canvasProp.getState == 0) {drawSideCanvas(canvas)}
    else {drawAerialCanvas(canvas)}
});

const playForwardOption = document.getElementById('playButton');
playForwardOption.addEventListener('click', skipYears);

// Detects a change in the tide option selected
var tideOptions = document.getElementsByName('tideSelection');
tideOptions.forEach(function(option) {
    option.addEventListener('change', function() {
        if (canvasProp.getState == 0) {drawSideCanvas(canvas)}
        else {drawAerialCanvas(canvas)}
    });
});

// Gets the tide option selected
function setSelectedTide() {
    var options = document.getElementsByName('tideSelection')
    for (var i = 0; i < options.length; i++) {
        if (options[i].checked) {
            tide.setTidalHeight(options[i].value);
            var tH = -1;
            if (options[i].value == 1) {tH = tide.getLow}
            else if (options[i].value == 2) {tH = tide.getAverage()}
            else {tH = tide.getHigh}
            tide.setHeight = tH;
            return options[i].value;
        }
    }
}

function setSelectWaveHeight() {
    maxWave.setHeight = document.getElementById('maxWaveHeightSlider').value / 2;
    
}

const seaWallSelected = document.getElementById('seawall');
seaWallSelected.addEventListener("change", function() {
    if (seaWallSelected.checked) {
        dropdownH.style.display = "block";
    } else {
        dropdownH.style.display = "none";
    }
})

const sandSelected = document.getElementById('sand');
sandSelected.addEventListener("change", function() {
    if (sandSelected.checked) {
        dropdownH.style.display = "block";
    } else {
        dropdownH.style.display = "none";
    }
})

var preventionSelected = document.getElementsByName("preventionBought");
for (var i = 0; i < preventionSelected.length; i++) {
    preventionSelected[i].addEventListener("change", function() {
        if (seaWallSelected.checked) {
            dropdownH.style.display = "block";
            buyHousesInstructions.style.display = "none";
        } else if(sandSelected.checked) {
            dropdownH.style.display = "block"
            buyHousesInstructions.style.display = "none";
        } 
        else {
            dropdownH.style.display = "none"
            buyHousesInstructions.style.display = "none";
        }
    });
}

var preventionOptions = document.getElementsByName('preventionBought');
preventionOptions.forEach(function(option) {
    option.addEventListener('change', updatePurchaseAmount);
});

var seaWallOpt = document.getElementById("preventionHeightOptions");
seaWallOpt.addEventListener('change', updatePurchaseAmount);

const preventionPurchase = document.getElementById('confirmedPurchase');
preventionPurchase.addEventListener('click', purchasePrevention);

function purchasePrevention() {
    var prevention = getSelectedPrevention()
    if (prevention != null) {
        var purchaseCost = parseInt((document.getElementById("purchaseAmountTot").textContent).replace(/\D/g,''));
        if (purchaseCost <= preventions.getBudget) {
            preventions.decreaseBudget(purchaseCost)
            document.getElementById("budgetRem").innerHTML = preventions.getBudget.toLocaleString();
            if (prevention.id != "sand") {
                document.addEventListener('mousemove', onMouseMove);
                let canvasElem = document.querySelector('#preventionCurser')
                canvasElem.addEventListener("click", function handler(e) {
                    var clickPos = getMousePosCanvas(e)
                    document.removeEventListener('mousemove', onMouseMove);
                    if (prevention.id == "seabees") {
                        const seaBee = Object.create(seaBees)
                        seaBee.setLength = clickPos + (seaBee.getWidth / 2);
                        seaBee.calcYPos();
                        preventions.addNew(seaBee)
                    } else if (prevention.id == "seawall") {
                        const seaWall = Object.create(seaWalls)
                        seaWall.setLength = clickPos + (seaWall.getWidth / 2);
                        seaWall.setHeight = (getUserPreventionHeight() / canvasProp.getRealHeight)
                        seaWall.calcYPos();
                        preventions.addNew(seaWall)
                    }
                    sortPreventions()
                    if (canvasProp.getState == 0) {
                        canvas = drawSidePreventions(canvas)
                        drawSideCanvas(canvas)
                    } else {drawAerialCanvas(canvas)}
                    e.currentTarget.removeEventListener(e.type, handler)
                })
            } else {
                var sandH = (getUserPreventionHeight() / (2 * canvasProp.getRealHeight));
                beach.setBeachMinHeight = beach.getBeachMinHeight - sandH;
                beach.setBeachMaxHeight = beach.getBeachMaxHeight - sandH;
                beach.setLifeSpan = 10;
                beach.calcDecreaseRate();
                sea.calcSeaLength();
                if (canvasProp.getState == 0) {
                    canvas = drawSidePreventions(canvas)
                    drawSideCanvas(canvas)
                } else {drawAerialCanvas(canvas)}
            }
        } else {
            window.alert("You do not have the budget available to make this purchase");
        }
    } else {window.alert("You need to select a prevention to buy!");}
}

// Gets position of mouse click from user as % of canvas
function getMousePosCanvas(event) {
    let canvas = document.getElementById('canvas');
    let rect = canvas.getBoundingClientRect();
    let x = (event.clientX - rect.left) / canvasProp.getCanvasWidth;
    let y = (event.clientY - rect.top) / canvasProp.getCanvasHeight;
    preventionCurser.style.display = "none";
    if (canvasProp.getState == 0) {return x}
    else {return (1 - y)}
}

// See through prevention to help with placement
let preventionCurser = document.getElementById('preventionCurser');
const onMouseMove = (e) =>{
    var prevention = getSelectedPrevention()
    let canvas = document.getElementById('canvas');
    let rect = canvas.getBoundingClientRect();
    if ((rect.left < e.pageX && ((rect.right - ((rect.right- rect.left) * (1-beach.getBeachWidth))) > e.pageX)) && (rect.top < e.pageY && rect.bottom > e.pageY)) {
        preventionCurser.style.display = "block";
        if (prevention.id =="seawall") {
            document.getElementById('preventionCurser').innerHTML = '<img src="' + "imgs/seaWall-1m.png" + '" />';
        } else {
            document.getElementById('preventionCurser').innerHTML = '<img src="' + "imgs/seaBee-1m.png" + '" />';
        }
        let x = (e.pageX - rect.left) / canvasProp.getCanvasWidth;
        let yPos = beach.getBeachMinHeight - (x * beach.getBeachSlope) - 0.03;
        preventionCurser.style.left = e.pageX + 'px';
        preventionCurser.style.top = (rect.top + ((rect.bottom-rect.top) * yPos)) + 'px';
    } else {
        preventionCurser.style.display = "none";
    }
}

const budgetIn = document.getElementById('budgetInput');
budgetIn.addEventListener('click', budgetInput);

function budgetInput() {
    const budgetIn = document.getElementById("budget-input");
    const val =  Number(budgetIn.value);
    if (val <= 0) {
        document.getElementById("budgetInError").innerHTML = "Please enter a positive number.";
    } else {
        canvasProp.setBudgetStatus = true;
        document.getElementById("budgetInError").innerHTML = "";
        preventions.setBudget = val;
        document.getElementById("budgetRem").innerHTML = preventions.getBudget.toLocaleString();
        document.getElementById("budget-input").disabled = true;
        document.getElementById("budgetInput").disabled = true;
        if (canvasProp.getWeatherStatus == true) {
            document.getElementById("playButton").disabled = false;
            document.getElementById("timeSlider").disabled = false;
            document.getElementById("confirmedPurchase").disabled = false;

            document.getElementById("seabees").disabled = false;
            document.getElementById("seawall").disabled = false;
            document.getElementById("sand").disabled = false;
        }
    }
}

const weatherSet = document.getElementById('setWeather');
weatherSet.addEventListener('click', setWeather);

function setWeather() {
    canvasProp.setWeatherStatus = true;
    setSelectedTide()
    setSelectWaveHeight()
    document.getElementById("seaRiseSlider").disabled = true;
    document.getElementById("maxWaveHeightSlider").disabled = true;
    document.getElementById("lowTide").disabled = true;
    document.getElementById("averageTide").disabled = true;
    document.getElementById("highTide").disabled = true;
    document.getElementById('setWeather').disabled = true;
    if (canvasProp.getBudgetStatus == true) {
        document.getElementById("playButton").disabled = false;
        document.getElementById("timeSlider").disabled = false;
        document.getElementById("confirmedPurchase").disabled = false;

        document.getElementById("seabees").disabled = false;
        document.getElementById("seawall").disabled = false;
        document.getElementById("sand").disabled = false;
    }
}

var budgetChange = document.getElementById("budget-input");
budgetChange.addEventListener('change', formatInBudget);

function formatInBudget() {
    const numberInput = document.getElementById("budget-input");
    const formattedNumber = Number(numberInput.value).toLocaleString();
    document.getElementById("budgetRem").innerHTML = formattedNumber
}

// *************************** Main Draw Functions **********************************

function skipYears() {
    for (let i = 0; i < 5; i++) {       // skips 5 years
        if (canvasProp.getYear < 77) {
            incrementYear()
        } else if (canvasProp.getSimFinished == false) {
            canvasProp.setSimFinished = true;
            winDetection()
        }
    }
}

function incrementYear() {
    var seaRise = document.getElementById("seaRiseSlider").value;
    canvasProp.incrementYear()
    sea.increaseSeaRise(seaRise / 77);    // sea rise next 77 years -> to 1 year avg
    const budgetInput = document.getElementById("budget-input");
    var budgetIncr = Number(budgetInput.value);   // budget increase every year
    preventions.increaseBudget(budgetIncr);
    checkHouseFalling()
    decreaseBeach()
    calcDuneErosion()
    document.getElementById("timeSlider").value = canvasProp.getYear;
    if (canvasProp.getState == 0) {drawSideCanvas(canvas)}
    else {drawAerialCanvas(canvas)}
    document.getElementById("currYear").innerHTML = 2023 + canvasProp.getYear;
    document.getElementById("budgetRem").innerHTML = preventions.getBudget.toLocaleString();
    if(canvasProp.getHousesDestroyed == true) {winDetection()}
}

function winDetection() {
    document.getElementById("playButton").disabled = true;
    document.getElementById("timeSlider").disabled = true;
    console.log("win detection")
    infoField.style.display = "none";
    infoHeader.style.display = "none";
    resultHolder.style.display = "block";
    document.getElementById("endSpend").innerHTML = preventions.getTotalSpent.toLocaleString();
    document.getElementById("housesDestroyed").innerHTML = (housesArr.getNumHousesDestroyed / housesArr.getHouses.length) * 100;
    document.getElementById("duneLost").innerHTML = Math.round((dune.getLengthLost * canvasProp.getRealLength) * 100) / 100;
}

function decreaseBeach() {
    if (beach.getLifeSpan > 0 ) {
        beach.decreaseHeight()
        tide.calculateTideLength();
        for(var i = 0; i < preventions.bought.length; i++) {
            var prev = preventions.bought[i]
            var minHeightAtPrev = beach.getAbsMinHeight - (prev.getLength * beach.getBeachSlope)
            var currHeightAtPrev = beach.getBeachMinHeight - ((prev.getLength - (prev.getWidth / 2)) * beach.getBeachSlope)
            if (minHeightAtPrev > prev.getYPos) {
                prev.setYPos = currHeightAtPrev
            }
        }
    }
}

function calcDuneErosion() {
    tide.setLength = getPreventionWaterLevel(tide.getLength, (beach.getAbsMinHeight - sea.getHeight - tide.getCurrHeight))
    var waveWashL = beach.getBeachWidth + maxWave.getWashLength
    var erosion = false;
    if(preventions.bought.length > 0) {
        var furtherestPrev = preventions.bought[preventions.bought.length - 1]
        var prevEnd = furtherestPrev.getLength + (furtherestPrev.getWidth / 2)
        if (waveWashL > tide.getLength) {
            if ((beach.getAbsMinHeight - sea.getHeight - tide.getCurrHeight) < beach.getBeachMaxHeight) {
                erosion = true;
            }
        } 
        else if ((sea.getLength > prevEnd) || (tide.getLength > prevEnd)) {
            if ((beach.getAbsMinHeight - sea.getHeight - tide.getCurrHeight) < beach.getBeachMaxHeight) {
                erosion = true;
            }
        }
    } else {
        if (waveWashL > tide.getLength) {
            if ((beach.getAbsMinHeight - sea.getHeight - tide.getCurrHeight) < beach.getBeachMaxHeight) {
                erosion = true;
            }
        } 
        else if ((beach.getAbsMinHeight - sea.getHeight - tide.getCurrHeight) < beach.getBeachMaxHeight) {
            erosion = true;
        }
    }
    if (erosion == true) {
        dune.erode(((beach.getAbsMinHeight - sea.getHeight - tide.getCurrHeight) - beach.getBeachMaxHeight) * -1);
    }
}

function sortPreventions() {
    if (preventions.bought.length > 1) {
        preventions.bought.sort(compare)
    }
}

function compare(a, b) {
    if (a.getLength < b.getLength) {return -1;}
    if (a.getLength > b.getLength) {return 1;}
    return 0;
}

// Gets the prevention option selected
function getSelectedPrevention() {
    var options = document.getElementsByName('preventionBought')
    for (var i = 0; i < options.length; i++) {
        if (options[i].checked) {
            return options[i];
        }
    }
    return null
}

function getPreventionWaterLevel(length, heightToCheck) {
    for(var i = 0; i < preventions.bought.length; i++) {
        var prev = preventions.bought[i]
        if (prev.name == "seawall") {
            if ((prev.getYPos - prev.getHeight) <= heightToCheck) {
                if (prev.getLength < length) {
                    return prev.getLength;
                } 
                break;
            }
        } else if (prev.name == "sand") {
            if ((prev.getYPos - prev.getHeight) <= heightToCheck) {
                if (prev.getLength < length) {
                    return prev.getLength;
                } 
                break;
            }
        }
    }
    return length;
}

function updatePurchaseAmount() {
    var prevention = getSelectedPrevention();
    if(prevention.id == "seabees") {
        document.getElementById("purchaseAmountTot").innerHTML = (prevention.value * 1).toLocaleString();
    } else if (prevention.id == "seawall") {
        var wallH = getUserPreventionHeight()
        document.getElementById("purchaseAmountTot").innerHTML = (prevention.value * wallH).toLocaleString();
    } else if (prevention.id == "sand") {
        var sandH = getUserPreventionHeight()
        document.getElementById("purchaseAmountTot").innerHTML = (prevention.value * sandH).toLocaleString();
    }
}

function getUserPreventionHeight() {
    var dropdown = document.getElementById("preventionHeightOptions");
    var selectedValue = dropdown.options[dropdown.selectedIndex].value;
    return selectedValue;
}

function drawRealDimLabels(canvas, xLabel, yLabel) {
    
    // height Canvas
    canvas = drawVerticalArrow(canvas, 0.45, 0.05, 0.02, 0.02)
    canvas = drawVerticalArrow(canvas, 0.55, 0.95, 0.02, -0.02)
    canvas.append("text")
        .attr("x", 0)
        .attr("y", canvasProp.getCanvasHeight * 0.5)
        .attr("text-anchor", "left")
        .style("font-size", "20px")
        .text(yLabel.toLocaleString() + "m");

    canvas = drawHorizontalArrow(canvas, 0.55, 0.98, 0.96, -0.01)
    canvas = drawHorizontalArrow(canvas, 0.45, 0.02, 0.96, 0.01)
    canvas.append("text")
        .attr("x", canvasProp.getCanvasWidth * 0.5)
        .attr("y", canvasProp.getCanvasHeight * 0.98)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text(xLabel.toLocaleString() + "m");

    // drawSide Labels
    if(canvasProp.getState == 0) {
        // draw wave dimensions
        if (canvasProp.getStateWaves == 1) {
            canvas = drawVerticalArrow(canvas, (beach.getAbsMinHeight - sea.getHeight - tide.getHeight - (maxWave.getHeight/2) - 0.02), (beach.getAbsMinHeight - sea.getHeight - tide.getHeight - maxWave.getHeight), 0.07, 0.02)
            canvas = drawVerticalArrow(canvas, (beach.getAbsMinHeight - sea.getHeight - tide.getHeight - (maxWave.getHeight/2) + 0.02), (beach.getAbsMinHeight - sea.getHeight - tide.getHeight), 0.07, -0.02)
        
            canvas.append("text")
                .attr("x", canvasProp.getCanvasWidth * 0.07)
                .attr("y", canvasProp.getCanvasHeight * (beach.getAbsMinHeight - sea.getHeight - tide.getHeight - (maxWave.getHeight/2)))
                .attr("text-anchor", "middle")
                .style("font-size", "20px")
                .text(((maxWave.getHeight) * canvasProp.getRealHeight).toLocaleString() + "m");
        }

        // draw house dimensions
        const tempHouse = housesArr.getHouses[8]
        if(tempHouse.getStatus == false) {
            canvas = drawVerticalArrow(canvas, ((beach.getAbsMaxHeight - dune.getDuneHeight - (tempHouse.getHeight)/2) - 0.02),  (beach.getAbsMaxHeight - dune.getDuneHeight - tempHouse.getHeight), (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + 0.115), 0.02)
            canvas = drawVerticalArrow(canvas, ((beach.getAbsMaxHeight - dune.getDuneHeight - (tempHouse.getHeight)/2) + 0.02),  (beach.getAbsMaxHeight - dune.getDuneHeight), (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + 0.115), -0.02)
        
            canvas.append("text")
                .attr("x", canvasProp.getCanvasWidth * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + 0.115))
                .attr("y", canvasProp.getCanvasHeight * (beach.getAbsMaxHeight - dune.getDuneHeight - (tempHouse.getHeight)/2))
                .attr("text-anchor", "middle")
                .style("font-size", "20px")
                .text(((tempHouse.getHeight) * canvasProp.getRealHeight).toLocaleString() + "m");
        }

    }

    return canvas
}


function drawVerticalArrow(canvas, min, max, x, arrowDirection) {
    const cH = canvasProp.getCanvasHeight
    const cW = canvasProp.getCanvasWidth
    var line = [
        {"x": cW * x, "y": cH * min},
        {"x": cW * x, "y": cH * max},
        {"x": cW * (x - 0.01), "y": cH * (max + arrowDirection)},
        {"x": cW * x, "y": cH * max},
        {"x": cW * (x + 0.01), "y": cH * (max + arrowDirection)},
        {"x": cW * x, "y": cH * max}
    ];
    
    var lineFunction = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });
    
    canvas.append("path")
        .attr("d", lineFunction(line))
        .attr("stroke", "black");

    return canvas
}

function drawHorizontalArrow(canvas, min, max, y, arrowDirection) {
    const cH = canvasProp.getCanvasHeight
    const cW = canvasProp.getCanvasWidth
    var line = [
        {"x": cW * min, "y": cH * y},
        {"x": cW * max, "y": cH * y},
        {"x": cW * (max + arrowDirection), "y": cH * (y - 0.01)},
        {"x": cW * max, "y": cH * y},
        {"x": cW * (max + arrowDirection), "y": cH * (y + 0.01)},
        {"x": cW * max, "y": cH * y}
    ];
    
    var lineFunction = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });
    
    canvas.append("path")
        .attr("d", lineFunction(line))
        .attr("stroke", "black");

    return canvas
}

function checkHouseFalling() {
    var distRow = 0;
    var tempStatus = true;
    var maxWaterDist = tide.getLength
    if (beach.getBeachWidth + maxWave.getWashLength > maxWaterDist) {maxWaterDist = beach.getBeachWidth + maxWave.getWashLength}
    for(var i = 0; i < 2; i++) {
        if (i > 0) {distRow = 0.13;}
        const tempHouse = housesArr.getHouses[i * 8]
        if (maxWaterDist > (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow + (tempHouse.getWidth /2))) {
            for(var j = i; j < ((1 + i) * 8); j++) {
                const tHouse = housesArr.getHouses[j]
                if (tHouse.getStatus == false) {
                    tHouse.setStatus = true;
                    tHouse.setHeight = 0.05;
                    housesArr.incrNumHousesDestroyed()
                }
            }
        } else {
            tempStatus = false;
        }
    }
    canvasProp.setHousesDestroyed = tempStatus;
}


// *************************** Side View Draw Functions **********************************

// Draws the side view of the beach object
function drawSideBeach(canvas) {
    const cH = canvasProp.getCanvasHeight
    const cW = canvasProp.getCanvasWidth
    var line = [
        {"x": cW * beach.getBeachWidth, "y": cH},
        {"x": cW * beach.getBeachWidth, "y": cH * beach.getBeachMaxHeight},
        {"x": cW * beach.getSlopeWidth, "y": cH * beach.getBeachMaxHeight},
        {"x": 0, "y": cH * beach.getBeachMinHeight},
        {"x": 0, "y": cH},
        {"x": cW * beach.getSlopeWidth, "y": cH}
    ];
    
    var lineFunction = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });
    
    canvas.append("path")
        .attr("d", lineFunction(line))
        // .attr("stroke", "black")
        // .attr("stroke-width", 0.5)
        .attr("fill", "#FAFAD2");

    // canvas.append("text")
    //     .attr("x", canvasProp.getCanvasWidth * 0.5)
    //     .attr("y", canvasProp.getCanvasHeight * 0.8)
    //     .attr("text-anchor", "middle")
    //     .style("font-size", "24px")
    //     .text("Beach");
    
    return canvas
}

// Draws the side view of the dune object
function drawSideDune(canvas) {
    const cH = canvasProp.getCanvasHeight
    const cW = canvasProp.getCanvasWidth
    var line = [
        {"x": cW * beach.getBeachWidth, "y": cH},
        {"x": cW * beach.getBeachWidth, "y": cH * beach.getBeachMaxHeight},
        {"x": cW * (beach.getBeachWidth + dune.bankLength), "y": cH * (beach.getAbsMaxHeight - dune.getDuneHeight)},
        {"x": cW, "y": cH * (beach.getAbsMaxHeight - dune.getDuneHeight)},
        {"x": cW, "y": cH},
        {"x": cW * beach.getBeachWidth, "y": cH}
    ];

    var lineFunction = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });
    
    canvas.append("path")
        .attr("d", lineFunction(line))
        // .attr("stroke", "black")
        // .attr("stroke-width", 0.5)
        .attr("fill", "#FAFAD2");

    // canvas.append("text")
    //     .attr("x", canvasProp.getCanvasWidth * 0.9)
    //     .attr("y", canvasProp.getCanvasHeight * 0.8)
    //     .attr("text-anchor", "middle")
    //     .style("font-size", "24px")
    //     .text("Dune");
    
    return canvas
}

function drawSideSea(canvas) {
    const cH = canvasProp.getCanvasHeight
    const cW = canvasProp.getCanvasWidth

    var seaLength = getPreventionWaterLevel(sea.getLength, (beach.getAbsMinHeight - sea.getHeight - tide.getHeight))
    
    var line = [
        {"x": 0, "y": cH},
        {"x": 0, "y": cH * (beach.getAbsMinHeight - sea.getHeight)},
        {"x": cW * seaLength, "y": cH * (beach.getAbsMinHeight - sea.getHeight)},
        {"x": cW * seaLength, "y": cH},
        {"x": 0, "y": cH},
    ];

    var lineFunction = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });
    
    canvas.append("path")
        .attr("d", lineFunction(line))
        .attr("fill", "#87CEFA")
    
    // if (sea.getHeight > 0 || sea.getLength > 0) {
    //     canvas.append("text")
    //         .attr("x", 20)
    //         .attr("y", ((cH * beach.getBeachMinHeight)) - 5)
    //         .attr("text-anchor", "middle")
    //         .style("font-size", "20px")
    //         .text("Sea");
    // }    

    return canvas
}

function drawSideTide(canvas) {
    var tH = tide.getHeight
    const cH = canvasProp.getCanvasHeight
    const cW = canvasProp.getCanvasWidth

    var tideLength = getPreventionWaterLevel(tide.getLength, (beach.getAbsMinHeight - sea.getHeight - tide.getHeight))

    var line = [
        {"x": 0, "y": cH * (beach.getAbsMinHeight - sea.getHeight)},
        {"x": 0, "y": cH * (beach.getAbsMinHeight - sea.getHeight - tide.currHeight)},
        {"x": cW * tideLength, "y": cH * (beach.getAbsMinHeight - sea.getHeight - tide.getCurrHeight)},
        {"x": cW * tideLength, "y": cH * (beach.getAbsMinHeight - sea.getHeight)},
        {"x": 0, "y": cH * (beach.getAbsMinHeight - sea.getHeight)}
    ];

    var lineFunction = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });

    canvas.append("path")
        .attr("d", lineFunction(line))
        .attr("fill", "#87CEFA")
    
    // if (tH != 0) {
    //     canvas.append("text")
    //         .attr("x", 50)
    //         .attr("y", (cH * (beach.getBeachMinHeight - sea.getHeight)) - 5)
    //         .attr("text-anchor", "middle")
    //         .style("font-size", "20px")
    //         .text("Tide");

    // }

    return canvas
}

function drawSideMaxWave(canvas) {
    var waveHeight = maxWave.getHeight
    var tH = tide.getHeight
    const cH = canvasProp.getCanvasHeight
    const cW = canvasProp.getCanvasWidth
    
    var seaH =  cH * (beach.getAbsMinHeight - sea.getHeight - tH)
    // Before Preventions
    var maxUnbroken = beach.getBeachWidth;
    var j = 0
    for (var j; j < preventions.bought.length; j++) {
        if (maxUnbroken > preventions.bought[j].getLength) {
            maxUnbroken = preventions.bought[j].getLength
            break;
        }
    }
    
    canvas = drawSideWave(canvas, tH, cW, cH, 0, maxUnbroken, waveHeight)

    var end = 0;
    //After preventions
    for (var i = j; i < preventions.bought.length; i++) {
        const prev = preventions.bought[i]
        if (i+1 < preventions.bought.length){
            end = preventions.bought[i+1].getLength - (preventions.bought[i+1].getWidth / 2)
        } else {
            maxWave.calculateWaveWashLength()
            end = beach.getBeachWidth + maxWave.getWashLength;
        }
        var prevHeight = cH * (prev.getYPos - prev.getHeight)
        if (prev.name == "seabees") {
            if (prevHeight <= seaH) {
                waveHeight = waveHeight * prev.getWaveDecrease
                canvas = drawSideWave(canvas, tH, cW, cH, prev.length - (prev.getWidth / 2), end, waveHeight, true)
            } else {
                waveHeight = waveHeight * 0.75;  // seabee only 25% decrease in wave height if sea & tide is higher than seabee
                canvas = drawSideWave(canvas, tH, cW, cH, prev.length - (prev.getWidth / 2), end, waveHeight, true)
            }
        } else if (prev.name == "seawall" || prev.name == "sand") {
            if (prevHeight <= seaH) {
                var maxExcessWave = waveHeight * 0.6;
                var excessWave = (prev.getYPos - prev.getHeight) - (beach.getAbsMinHeight - sea.getHeight - tH - waveHeight)
                if (excessWave < maxExcessWave) {
                    waveHeight = excessWave
                } else {waveHeight = maxExcessWave}
                canvas = drawSideWave(canvas, tH, cW, cH, prev.length - (prev.getWidth / 2), end, waveHeight, true)
            } else {
                waveHeight = waveHeight * 0.6; // wall only 40% decrease in wave height if sea & tide is higher than wall
                canvas = drawSideWave(canvas, tH, cW, cH, prev.length - (prev.getWidth / 2), end, waveHeight, false)
            }
        }
    }
    
    return canvas
}

function drawSideWave(canvas, tH, cW, cH, xmin, xmax, waveH, broken) {
    var line = [];
    var highLow = 0;
    var lineFunction = null;
    if (broken == true) {
        line = [
            {"x": cW * xmin, "y": cH * beach.getAbsMinHeight},
            {"x": cW * xmin, "y": cH * (beach.getAbsMinHeight - sea.getHeight - tH)},
            {"x": cW * xmax, "y": cH * (beach.getAbsMinHeight - sea.getHeight - tH)},
            {"x": cW * xmax, "y": cH * beach.getAbsMinHeight},
            {"x": cW * xmin, "y": cH * beach.getAbsMinHeight},
        ];

        line.push({"x": cW * xmax, "y": cH * (beach.getAbsMinHeight)})

        lineFunction = d3.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })

        canvas.append("path")
            .attr("d", lineFunction(line))
            // .attr("fill", "#87CEFA")
            .attr("fill", "#ABDCFB")
    }
    line = []
    for (var i = xmin; i < xmax; i = i + 0.09) {
        var variableT = 0;
        if (highLow % 2 != 0) {
            variableT = waveH
        }
        var height = cH * (beach.getAbsMinHeight - sea.getHeight - tH - variableT)
        line[highLow] = {"x": cW * i, "y": height}
        highLow = highLow + 1;
    }
    line.push({"x": cW * xmax, "y": cH * (beach.getAbsMinHeight - sea.getHeight - tH)})

    lineFunction = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .curve(d3.curveNatural);

    canvas.append("path")
        .attr("d", lineFunction(line))
        .attr("fill", "#ABDCFB")
        // .attr("fill", "#87CEFA")

    return canvas
}

function drawSidePreventions(canvas) {
    for(var i = 0; i < preventions.bought.length; i++) {
        var prev = preventions.bought[i]
        if (prev.name == "seabees") {
            canvas = drawSideSeaBee(prev, canvas)
        } else if (prev.name == "seawall") {
            canvas = drawSideSeaWall(prev, canvas)
        }
    }
    return canvas;
}

function drawSideSeaBee(sbee, canvas) {
    const cH = canvasProp.getCanvasHeight
    const cW = canvasProp.getCanvasWidth

    var line = [
        {"x": cW * sbee.getLength, "y": cH * sbee.getYPos},
        {"x": cW * sbee.getLength, "y": cH * (sbee.getYPos - sbee.getHeight)},
        {"x": cW * (sbee.getLength - sbee.getWidth), "y": cH * (sbee.getYPos - sbee.getHeight)},
        {"x": cW * (sbee.getLength - sbee.getWidth), "y": cH * sbee.getYPos},
        {"x": cW * sbee.getLength, "y": cH * sbee.getYPos}
    ];
    
    var lineFunction = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });
    
    canvas.append("path")
        .attr("d", lineFunction(line))
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .attr("fill", "#808080");

    return canvas;
}

function drawSideSeaWall(seawall, canvas) {
    const cH = canvasProp.getCanvasHeight
    const cW = canvasProp.getCanvasWidth

    var line = [
        {"x": cW * seawall.getLength, "y": cH * seawall.getYPos},
        {"x": cW * seawall.getLength, "y": cH * (seawall.getYPos - seawall.getHeight)},
        {"x": cW * (seawall.getLength - seawall.getWidth), "y": cH * (seawall.getYPos - seawall.getHeight)},
        {"x": cW * (seawall.getLength - seawall.getWidth), "y": cH * seawall.getYPos},
        {"x": cW * seawall.getLength, "y": cH * seawall.getYPos}
    ];
    
    var lineFunction = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });
    
    canvas.append("path")
        .attr("d", lineFunction(line))
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .attr("fill", "#595959");

    return canvas;
}

function drawSideHouse(canvas) {
    const cH = canvasProp.getCanvasHeight
    const cW = canvasProp.getCanvasWidth

    var distRow = 0;
    var fillColour = "#946b4b"
    for(var i = 0; i < 2; i ++) {
        const tempHouse = housesArr.getHouses[i * 8]
        if (i > 0) {distRow = 0.13; fillColour = "#a9886e"}
        var line = []
        if(tempHouse.getStatus == false) {
            line = [
                {"x": cW * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow), "y": cH * (beach.getAbsMaxHeight - dune.getDuneHeight)},
                {"x": cW * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow), "y": cH * (beach.getAbsMaxHeight - dune.getDuneHeight - (tempHouse.getHeight * 0.91))},
                {"x": cW * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow + tempHouse.getWidth), "y": cH * (beach.getAbsMaxHeight - dune.getDuneHeight - (tempHouse.getHeight * 0.91))},
                {"x": cW * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow + tempHouse.getWidth), "y": cH * (beach.getAbsMaxHeight - dune.getDuneHeight)},
                {"x": cW * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow), "y": cH * (beach.getAbsMaxHeight - dune.getDuneHeight)}
            ];
        } else {
            line = [
                {"x": cW * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow), "y": cH * (beach.getAbsMaxHeight)},
                {"x": cW * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow + (tempHouse.getWidth/2)), "y": cH * (beach.getAbsMaxHeight - tempHouse.getHeight)},
                {"x": cW * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow + tempHouse.getWidth), "y": cH * (beach.getAbsMaxHeight)},
                {"x": cW * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow), "y": cH * (beach.getAbsMaxHeight)}
            ];
        }
        
        var lineFunction = d3.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; });
            
        canvas.append("path")
            .attr("d", lineFunction(line))
            .attr("fill", fillColour)

        if(tempHouse.getStatus == false) {
            canvas = drawHouseRoof(canvas, tempHouse, distRow, fillColour)
            canvas = drawHouseDoor(canvas, tempHouse, distRow)
            canvas = drawHouseWindows(canvas, tempHouse, distRow)
        }
    }

    return canvas;
}

function drawHouseRoof(canvas, tempHouse, distRow, fillColour) {
    const cH = canvasProp.getCanvasHeight
    const cW = canvasProp.getCanvasWidth

    var line = [
        {"x": cW * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow + (tempHouse.getWidth/2)), "y": cH * (beach.getAbsMaxHeight - dune.getDuneHeight - tempHouse.getHeight)},
        {"x": cW * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow - 0.02), "y": cH * (beach.getAbsMaxHeight - dune.getDuneHeight - (tempHouse.getHeight * 0.9))},
        {"x": cW * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow + tempHouse.getWidth + 0.02), "y": cH * (beach.getAbsMaxHeight - dune.getDuneHeight - (tempHouse.getHeight * 0.9))},
        {"x": cW * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow + (tempHouse.getWidth/2)), "y": cH * (beach.getAbsMaxHeight - dune.getDuneHeight - tempHouse.getHeight)}
    ];

    var lineFunction = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });
            
    canvas.append("path")
        .attr("d", lineFunction(line))
        .attr("stroke", "black")
        .attr("stroke-width", 0.25)
        .attr("fill", fillColour)

    return canvas;
}


function drawHouseDoor(canvas, tempHouse, distRow) {
    const cH = canvasProp.getCanvasHeight
    const cW = canvasProp.getCanvasWidth

    var line = [
        {"x": cW * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow + (tempHouse.getWidth/2) - 0.01), "y": cH * (beach.getAbsMaxHeight - dune.getDuneHeight)},
        {"x": cW * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow + (tempHouse.getWidth/2) - 0.01), "y": cH * (beach.getAbsMaxHeight - dune.getDuneHeight - (tempHouse.getHeight * 0.4))},
        {"x": cW * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow + (tempHouse.getWidth/2) + 0.01), "y": cH * (beach.getAbsMaxHeight - dune.getDuneHeight - (tempHouse.getHeight * 0.4))},
        {"x": cW * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow + (tempHouse.getWidth/2) + 0.01), "y": cH * (beach.getAbsMaxHeight - dune.getDuneHeight)},
        {"x": cW * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow + (tempHouse.getWidth/2) - 0.01), "y": cH * (beach.getAbsMaxHeight - dune.getDuneHeight)}
    ];

    var lineFunction = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });
            
    canvas.append("path")
        .attr("d", lineFunction(line))
        .attr("fill", "#FFBF00")

    return canvas;
}

function drawHouseWindows(canvas, tempHouse, distRow) {
    const cH = canvasProp.getCanvasHeight
    const cW = canvasProp.getCanvasWidth

    for(var i = 0; i < 2; i ++) {
        var windowNo = i * (tempHouse.getWidth/100) * 15
        var windowDist = (tempHouse.getWidth/10) * 3;
        var windowGap = i * (tempHouse.getWidth/2)
        var line = [
            {"x": cW * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow + windowNo + windowGap), "y": cH * (beach.getAbsMaxHeight - dune.getDuneHeight - (tempHouse.getHeight * 0.55))},
            {"x": cW * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow + windowNo + windowGap), "y": cH * (beach.getAbsMaxHeight - dune.getDuneHeight - (tempHouse.getHeight * 0.85))},
            {"x": cW * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow + windowNo + windowDist + windowGap), "y": cH * (beach.getAbsMaxHeight - dune.getDuneHeight - (tempHouse.getHeight * 0.85))},
            {"x": cW * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow + windowNo + windowDist + windowGap), "y": cH * (beach.getAbsMaxHeight - dune.getDuneHeight - (tempHouse.getHeight * 0.55))},
            {"x": cW * (beach.getSlopeWidth + dune.absBankLength + tempHouse.getDunePos + distRow + windowNo + windowGap), "y": cH * (beach.getAbsMaxHeight - dune.getDuneHeight - (tempHouse.getHeight * 0.55))}
        ];

        var lineFunction = d3.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; });
                
        canvas.append("path")
            .attr("d", lineFunction(line))
            .attr("fill", "#F9F6EE")
    }

    return canvas;
}

// *************************** Aerial View Draw Functions **********************************

// Draws the aerial view of the beach object
function drawAerialBeach(canvas) {
    const cH = canvasProp.getCanvasHeight
    const cW = canvasProp.getCanvasWidth
    var line = [
        {"x": 0, "y": cH},
        {"x": 0, "y": cH * (1 - beach.getBeachWidth)},
        {"x": cW, "y": cH * (1 - beach.getBeachWidth)},
        {"x": cW, "y": cH},
        {"x": 0, "y": cH}
    ];
    
    var lineFunction = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });
    
    canvas.append("path")
        .attr("d", lineFunction(line))
        // .attr("stroke", "black")
        // .attr("stroke-width", 0.5)
        .attr("fill", "#FAFAD2");

    // canvas.append("text")
    //     .attr("x", canvasProp.getCanvasWidth * 0.475)
    //     .attr("y", canvasProp.getCanvasHeight * 0.5)
    //     .attr("text-anchor", "middle")
    //     .style("font-size", "24px")
    //     .text("Beach");
    
    return canvas
}

// Draws the aerial view of the dune object
function drawAerialDune(canvas) {
    const cH = canvasProp.getCanvasHeight
    const cW = canvasProp.getCanvasWidth
    var line = [
        {"x": 0, "y": cH * (dune.getDuneBankLength + dune.getDuneWidth)},
        {"x": 0, "y": 0},
        {"x": cW, "y": 0},
        {"x": cW, "y": cH * (dune.getDuneBankLength + dune.getDuneWidth)},
        {"x": 0, "y": cH * (dune.getDuneBankLength + dune.getDuneWidth)}
    ];
    
    var lineFunction = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });
    
    canvas.append("path")
        .attr("d", lineFunction(line))
        // .attr("stroke", "black")
        // .attr("stroke-width", 0.5)
        .attr("fill", "#FAFAD2");
    
    return canvas
}

function drawAerialSea(canvas) {
    const cH = canvasProp.getCanvasHeight
    const cW = canvasProp.getCanvasWidth

    var seaLength = getPreventionWaterLevel(sea.getLength, (beach.getAbsMinHeight - sea.getHeight - tide.getHeight))

    var line = [
        {"x": 0, "y": cH},
        {"x": 0, "y": cH * (1 - seaLength)},
        {"x": cW, "y": cH * (1 - seaLength)},
        {"x": cW, "y": cH},
        {"x": 0, "y": cH},
    ];

    var lineFunction = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });
    
    canvas.append("path")
        .attr("d", lineFunction(line))
        .attr("fill", "#87CEFA")
    
    // if (sea.getHeight > 0 || sea.getLength > 0) {
    //     canvas.append("text")
    //         .attr("x", canvasProp.getCanvasWidth * 0.475)
    //         .attr("y", canvasProp.getCanvasHeight * 0.9)
    //         .attr("text-anchor", "middle")
    //         .style("font-size", "24px")
    //         .text("Sea");
    // }

    return canvas
}

function drawAerialTide(canvas) {
    const cH = canvasProp.getCanvasHeight
    const cW = canvasProp.getCanvasWidth

    var tideLength = getPreventionWaterLevel(tide.getLength, (beach.getAbsMinHeight - sea.getHeight - tide.getHeight))

    if (tideLength > sea.getLength) {
        var line = [
            {"x": 0, "y": cH * (1 - sea.getLength)},
            {"x": 0, "y": cH * (1 - tideLength)},
            {"x": cW, "y": cH * (1 - tideLength)},
            {"x": cW, "y": cH * (1 - sea.getLength)},
            {"x": 0, "y": cH * (1 - sea.getLength)},
        ];
    
        var lineFunction = d3.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; });
        
        canvas.append("path")
            .attr("d", lineFunction(line))
            .attr("fill", "#87CEFA")
        
        // if (tide.getHeight != 0) {
        //     canvas.append("text")
        //         .attr("x", cW * 0.475)
        //         .attr("y", cH * (1 - sea.getLength) - 10)
        //         .attr("text-anchor", "middle")
        //         .style("font-size", "24px")
        //         .text("Tide");
        // }
    }

    return canvas
}

function drawAerialWave(canvas) {
    const cH = canvasProp.getCanvasHeight
    const cW = canvasProp.getCanvasWidth

        var line = [
            {"x": 0, "y": cH},
            {"x": 0, "y": cH * (1 - beach.getBeachWidth + maxWave.getWashLength)},
            {"x": cW, "y": cH * (1 - beach.getBeachWidth + maxWave.getWashLength)},
            {"x": cW, "y": cH},
            {"x": 0, "y": cH },
        ];
    
        var lineFunction = d3.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; });
        
        canvas.append("path")
            .attr("d", lineFunction(line))
            .attr("fill", "#ABDCFB")

    return canvas
}

function drawAerialPreventions(canvas) {
    for(var i = 0; i < preventions.bought.length; i++) {
        var prev = preventions.bought[i]
        if (prev.name == "seabees") {
            canvas = drawAerialSeaBee(prev, canvas)
        } else if (prev.name == "seawall") {
            var seaH =  beach.getBeachMinHeight - sea.getHeight - tide.getHeight

            if (prev.getYPos - prev.getHeight <= seaH) {
                if (canvasProp.getStateWaves == 1) {
                    var waveH = beach.getAbsMinHeight - sea.getHeight - tide.getCurrHeight - maxWave.getHeight
                    if (prev.getYPos - prev.getHeight <= waveH) {
                        canvas = drawAerialSeaWall(prev, canvas)
                    }
                } else {
                    canvas = drawAerialSeaWall(prev, canvas)
                }
            }
        }
    }
    return canvas;
}

function drawAerialSeaBee(seeB, canvas) {
    const cH = canvasProp.getCanvasHeight
    const cW = canvasProp.getCanvasWidth

    for (var i = 0; i < cW; i = i + 25) {
        canvas.append('image')
            .attr("xlink:href", "imgs/seabeeAerial.png")
            .attr('width', 21)
            .attr('height', 21)
            .attr("x", 0 + i)
            .attr("y", cH * (1 - seeB.getLength));
    }

    return canvas;
}

function drawAerialSeaWall (seaWall, canvas) {
    const cH = canvasProp.getCanvasHeight
    const cW = canvasProp.getCanvasWidth
    var line = [
        {"x": 0, "y": cH * (1 - seaWall.getLength + (seaWall.getWidth / 2))},
        {"x": 0, "y": cH * (1 - seaWall.getLength - (seaWall.getWidth / 2))},
        {"x": cW, "y": cH * (1 - seaWall.getLength - (seaWall.getWidth / 2))},
        {"x": cW, "y": cH * (1 - seaWall.getLength + (seaWall.getWidth / 2))},
        {"x": 0, "y": cH * (1 - seaWall.getLength + (seaWall.getWidth / 2))}
    ];
    
    var lineFunction = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });
    
    canvas.append("path")
        .attr("d", lineFunction(line))
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .attr("fill", "#595959");
    
    return canvas
}

function drawAerialHouses(canvas) {
    const cH = canvasProp.getCanvasHeight
    const cW = canvasProp.getCanvasWidth
    var distRow = 0;
    var fillColour = "#946b4b"
    for (var i = 0; i < housesArr.getHouses.length; i++) {
        const tempHouse = housesArr.getHouses[i]
        if (i >= 8) {distRow = 0.13; fillColour = "#a9886e"}
        var line = [
            {"x": cW * tempHouse.getXPos, "y": cH * (1 - beach.getSlopeWidth - dune.absBankLength - tempHouse.getDunePos - distRow)},
            {"x": cW * tempHouse.getXPos, "y": cH * (1 - beach.getSlopeWidth - dune.absBankLength - tempHouse.getDunePos - distRow - tempHouse.getWidth)},
            {"x": cW * (tempHouse.getXPos + tempHouse.getLength), "y": cH * (1 - beach.getSlopeWidth - dune.absBankLength - tempHouse.getDunePos - distRow - tempHouse.getWidth)},
            {"x": cW * (tempHouse.getXPos + tempHouse.getLength), "y": cH * (1 - beach.getSlopeWidth - dune.absBankLength - tempHouse.getDunePos - distRow)},
            {"x": cW * tempHouse.getXPos, "y": cH * (1 - beach.getSlopeWidth - dune.absBankLength - tempHouse.getDunePos - distRow)}
        ];
    
        var lineFunction = d3.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; });
        
        canvas.append("path")
            .attr("d", lineFunction(line))
            .attr("fill", fillColour)
    }
    return canvas
}