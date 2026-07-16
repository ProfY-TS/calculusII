const container = document.getElementById("jacobian-demo");

container.innerHTML = `
<div style="display:flex; gap:30px;">

<div>
<h3>Original Space</h3>
<svg id="leftCanvas" width="600" height="600"
style="border:1px solid #999;background:white"></svg>
</div>

<div>
<h3>Transformed Space</h3>
<svg id="rightCanvas" width="600" height="600"></svg>
</div>

</div>

<div style="margin-top:20px;font-family:Arial">

<h3>Jacobian Matrix</h3>

<div id="coordinates"></div>

<pre id="matrix"></pre>

<div id="det"></div>

</div>
`;

const svgLeft = document.getElementById("leftCanvas");
const svgRight = document.getElementById("rightCanvas");

const W = 600;
const H = 600;
const SCALE = 80;

function sx(x){
    return W/2 + x*SCALE;
}

function sy(y){
    return H/2 - y*SCALE;
}

function wx(px){
    return (px-W/2)/SCALE;
}

function wy(py){
    return -(py-H/2)/SCALE;
}

// ----------------------------------------------------
// Coordinate axes
// ----------------------------------------------------

function make(tag){
    return document.createElementNS(
        "http://www.w3.org/2000/svg",
        tag
    );
}

function drawGrid(svg) {

    const spacing = SCALE;   // 1 unit apart

    // Vertical grid lines
    for (let x = W/2; x <= W; x += spacing) {
        svg.innerHTML += `
        <line x1="${x}" y1="0" x2="${x}" y2="${H}"
        stroke="#dddddd" stroke-width="1"/>
        `;
    }

    for (let x = W/2 - spacing; x >= 0; x -= spacing) {
        svg.innerHTML += `
        <line x1="${x}" y1="0" x2="${x}" y2="${H}"
        stroke="#dddddd" stroke-width="1"/>
        `;
    }

    // Horizontal grid lines
    for (let y = H/2; y <= H; y += spacing) {
        svg.innerHTML += `
        <line x1="0" y1="${y}" x2="${W}" y2="${y}"
        stroke="#dddddd" stroke-width="1"/>
        `;
    }

    for (let y = H/2 - spacing; y >= 0; y -= spacing) {
        svg.innerHTML += `
        <line x1="0" y1="${y}" x2="${W}" y2="${y}"
        stroke="#dddddd" stroke-width="1"/>
        `;
    }

    // Main axes (drawn last so they appear darker)
    svg.innerHTML += `
    <line x1="0" y1="${H/2}" x2="${W}" y2="${H/2}"
    stroke="black" stroke-width="2"/>

    <line x1="${W/2}" y1="0" x2="${W/2}" y2="${H}"
    stroke="black" stroke-width="2"/>
    `;
}

function drawAxisLabels(svg) {

    const fontSize = 14;

    // ----- x-axis labels -----
    for (let x = -4; x <= 4; x++) {

        if (x === 0) continue;

        const label = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );

        label.setAttribute("x", sx(x));
        label.setAttribute("y", H/2 + 20);

        label.setAttribute("text-anchor", "middle");
        label.setAttribute("font-size", fontSize);

        label.textContent = x;

        svg.appendChild(label);
    }

    // ----- y-axis labels -----
    for (let y = -4; y <= 4; y++) {

        if (y === 0) continue;

        const label = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );

        label.setAttribute("x", W/2 - 12);
        label.setAttribute("y", sy(y) + 5);

        label.setAttribute("text-anchor", "end");
        label.setAttribute("font-size", fontSize);

        label.textContent = y;

        svg.appendChild(label);
    }

    // Label the origin
    const origin = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
    );

    origin.setAttribute("x", W/2 - 10);
    origin.setAttribute("y", H/2 + 20);
    origin.setAttribute("font-size", fontSize);

    origin.textContent = "0";

    svg.appendChild(origin);
}

function drawPolarGrid(svg){

    const maxR = 4;

    // concentric circles
    for(let r=0.5; r<=maxR; r+=0.5){

        const c = make("circle");

        c.setAttribute("cx",W/2);
        c.setAttribute("cy",H/2);
        c.setAttribute("r",r*SCALE);

        c.setAttribute("fill","none");
        c.setAttribute("stroke","#dddddd");

        svg.appendChild(c);

    }

    // radial lines every 30°
    for(let deg=0;deg<360;deg+=30){

        const t = deg*Math.PI/180;

        const x = maxR*Math.cos(t);
        const y = maxR*Math.sin(t);

        const line = make("line");

        line.setAttribute("x1",sx(0));
        line.setAttribute("y1",sy(0));
        line.setAttribute("x2",sx(x));
        line.setAttribute("y2",sy(y));

        line.setAttribute("stroke","#dddddd");

        svg.appendChild(line);

    }

    // axes
    svg.innerHTML += `
    <line x1="0" y1="${H/2}" x2="${W}" y2="${H/2}"
    stroke="black" stroke-width="2"/>

    <line x1="${W/2}" y1="0" x2="${W/2}" y2="${H}"
    stroke="black" stroke-width="2"/>
    `;
}

function drawWarpedGrid(svg){

    const gridMin = -4;
    const gridMax = 4;

    const spacing = 0.5;   // distance between grid lines
    const step = 0.05;     // smoothness of each curve

    // ---------- Vertical curves ----------
    for(let x = gridMin; x <= gridMax; x += spacing){

        let d = "";

        for(let y = gridMin; y <= gridMax; y += step){

            const p = T(x,y);

            if(d==="")
                d = `M ${sx(p.x)} ${sy(p.y)}`;
            else
                d += ` L ${sx(p.x)} ${sy(p.y)}`;

        }

        const path = make("path");

        path.setAttribute("d", d);
        path.setAttribute("fill","none");
        path.setAttribute("stroke","red");
        path.setAttribute("stroke-width","1");

        svg.appendChild(path);

    }

    // ---------- Horizontal curves ----------
    for(let y = gridMin; y <= gridMax; y += spacing){

        let d = "";

        for(let x = gridMin; x <= gridMax; x += step){

            const p = T(x,y);

            if(d==="")
                d = `M ${sx(p.x)} ${sy(p.y)}`;
            else
                d += ` L ${sx(p.x)} ${sy(p.y)}`;

        }

        const path = make("path");

        path.setAttribute("d", d);
        path.setAttribute("fill","none");
        path.setAttribute("stroke","red");
        path.setAttribute("stroke-width","1");

        svg.appendChild(path);

    }

}

drawGrid(svgLeft);
drawPolarGrid(svgRight);
drawAxisLabels(svgRight);
drawAxisLabels(svgLeft);

const square = make("polygon");
square.setAttribute("fill","rgba(80,140,255,0.25)");
square.setAttribute("stroke","blue");

svgLeft.appendChild(square);

const para = make("polygon");
para.setAttribute("fill","rgba(255,140,0,0.35)");
para.setAttribute("stroke","orange");
para.setAttribute("stroke-width","2");

svgRight.appendChild(para);

const e1 = make("line");
const e2 = make("line");

e1.setAttribute("stroke","red");
e2.setAttribute("stroke","green");

e1.setAttribute("stroke-width",3);
e2.setAttribute("stroke-width",3);

svgRight.appendChild(e1);
svgRight.appendChild(e2);

const pointLeft = make("circle");
pointLeft.setAttribute("r",7);
pointLeft.setAttribute("fill","black");
svgLeft.appendChild(pointLeft);

const pointRight = make("circle");
pointRight.setAttribute("r",7);
pointRight.setAttribute("fill","black");
svgRight.appendChild(pointRight);

let P = {
    x:1,
    y:1
};

// -------------------------------------------
// Example transformation
//
// Change these equations to anything you want
// -------------------------------------------

// Global nonlinear transformation
function T(x,y){

    const r = Math.sqrt(x*x+y*y);
    const theta = Math.atan2(y,x);

    return{
        x:r*Math.cos(theta),
        y:r*Math.sin(theta)
    };

}

function J(r, theta){

    return [
        [Math.cos(theta), -r*Math.sin(theta)],
        [Math.sin(theta),  r*Math.cos(theta)]
    ];

}

// -------------------------------------------

function update(){

    pointLeft.setAttribute(
    "cx",
    sx(P.x)
    );

    pointLeft.setAttribute(
    "cy",
    sy(P.y)
    );

    const TP = T(P.x,P.y);
    // Cartesian -> Polar
    const r = Math.sqrt(P.x * P.x + P.y * P.y);
    const theta = Math.atan2(P.y, P.x);

    pointRight.setAttribute(
    "cx",
    sx(TP.x)
    );

    pointRight.setAttribute(
    "cy",
    sy(TP.y)
    );

    const eps = 0.20;

    const sq = [
        [P.x-eps,P.y-eps],
        [P.x+eps,P.y-eps],
        [P.x+eps,P.y+eps],
        [P.x-eps,P.y+eps]
    ];

    square.setAttribute(
        "points",
        sq.map(v=>`${sx(v[0])},${sy(v[1])}`).join(" ")
    );

    const A = J(r, theta);

    const Je1 = [
        A[0][0]*eps,
        A[1][0]*eps
    ];

    const Je2 = [
        A[0][1]*eps,
        A[1][1]*eps
    ];

    const p0 = [TP.x, TP.y];

    const p1 = [
        TP.x + Je1[0],
        TP.y + Je1[1]
    ];

    const p2 = [
        TP.x + Je2[0],
        TP.y + Je2[1]
    ];

    const p3 = [
        TP.x + Je1[0] + Je2[0],
        TP.y + Je1[1] + Je2[1]
    ];

    para.setAttribute(
    "points",
    `
${sx(p0[0])},${sy(p0[1])}
${sx(p1[0])},${sy(p1[1])}
${sx(p3[0])},${sy(p3[1])}
${sx(p2[0])},${sy(p2[1])}
`
);

    e1.setAttribute("x1",sx(TP.x));
    e1.setAttribute("y1",sy(TP.y));
    e1.setAttribute("x2",sx(p1[0]));
    e1.setAttribute("y2",sy(p1[1]));

    e2.setAttribute("x1",sx(TP.x));
    e2.setAttribute("y1",sy(TP.y));
    e2.setAttribute("x2",sx(p2[0]));
    e2.setAttribute("y2",sy(p2[1]));

    const det =
        A[0][0]*A[1][1]-
        A[0][1]*A[1][0];

    document.getElementById("matrix").textContent =
`J =
[ ${A[0][0].toFixed(3)}   ${A[0][1].toFixed(3)} ]
[ ${A[1][0].toFixed(3)}   ${A[1][1].toFixed(3)} ]`;

    document.getElementById("det").innerHTML =
`det(J) = <b>${det.toFixed(3)}</b>`;

document.getElementById("coordinates").innerHTML =
`
<b>Cartesian:</b>
(${P.x.toFixed(3)}, ${P.y.toFixed(3)})<br>

<b>Polar:</b>
r = ${r.toFixed(3)},
θ = ${(theta*180/Math.PI).toFixed(1)}°
`;
}

update();

let dragging = false;

pointLeft.addEventListener("mousedown",()=>{
    dragging = true;
});

window.addEventListener("mouseup",()=>{
    dragging = false;
});

svgLeft.addEventListener("mousemove",e=>{

    if(!dragging) return;

    const r = svgLeft.getBoundingClientRect();

    P.x = Math.max(-3,
          Math.min(3,
          wx(e.clientX-r.left)));

    P.y = Math.max(-3,
          Math.min(3,
          wy(e.clientY-r.top)));

    update();

});


here