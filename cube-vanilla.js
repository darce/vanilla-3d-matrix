const info = document.querySelector('.info')
const cube = document.querySelector('.cube')
const container = document.querySelector('.container')
const body = document.querySelector('body')
const center = { x: cube.offsetWidth / 2, y: cube.offsetHeight / 2 }

const cubePointsArray = [
    { x: -0.5, y: -0.5, z: -0.5 },
    { x: 0.5, y: -0.5, z: -0.5 },
    { x: 0.5, y: 0.5, z: -0.5 },
    { x: -0.5, y: 0.5, z: -0.5 },
    { x: -0.5, y: -0.5, z: 0.5 },
    { x: 0.5, y: -0.5, z: 0.5 },
    { x: 0.5, y: 0.5, z: 0.5 },
    { x: -0.5, y: 0.5, z: 0.5 }
]

const phi = (1 + Math.sqrt(5)) / 2;

const dodecahedronPointsArray = [
    { x: 0, y: 1, z: phi },
    { x: 0, y: -1, z: -phi },
    { x: 1, y: phi, z: 0 },
    { x: -1, y: phi, z: 0 },
    { x: 1, y: -phi, z: 0 },
    { x: -1, y: -phi, z: 0 },
    { x: phi, y: 0, z: 1 },
    { x: -phi, y: 0, z: -1 },
    { x: phi, y: 0, z: -1 },
    { x: -phi, y: 0, z: 1 },
    { x: 0, y: 1, z: -phi },
    { x: 0, y: -1, z: phi }
];

const tetrahedronPointsArray = [
    { x: -0.5, y: -0.5, z: -0.5 },
    { x: 0.5, y: -0.5, z: -0.5 },
    { x: 0, y: 0.5, z: -0.5 },
    { x: 0, y: 0, z: 0.5 }
];


const projectPoints = (pointsArray, distance) => {
    const result = []
    pointsArray.forEach(point => {
        const f = 1 / (distance - point.z)
        const projectionMatrix = [
            [f, 0, 0],
            [0, f, 0],
            [0, 0, 1]]
        result.push(matrixMultiplyPoint(projectionMatrix, point))
    })
    return result
}

const rotationX = (pointsArray, angle) => {
    const rotationMatrix = [
        [1, 0, 0],
        [0, Math.cos(angle), -Math.sin(angle)],
        [0, Math.sin(angle), Math.cos(angle)]
    ]
    return transformPointsWithMatrix(pointsArray, rotationMatrix)
}

const rotationY = (pointsArray, angle) => {
    const rotationMatrix = [
        [Math.cos(angle), 0, -Math.sin(angle)],
        [0, 1, 0],
        [-Math.sin(angle), 0, Math.cos(angle)]
    ]
    return transformPointsWithMatrix(pointsArray, rotationMatrix)
}

const scaleXYZ = (pointsArray, scale) => {
    const scaleMatrix = [
        [scale, 0, 0],
        [0, scale, 0],
        [0, 0, 1]
    ]
    return transformPointsWithMatrix(pointsArray, scaleMatrix)
}

const rotationZ = (pointsArray, angle) => {
    const rotationMatrix = [
        [Math.cos(angle), -Math.sin(angle), 0],
        [Math.sin(angle), Math.cos(angle), 0],
        [0, 0, 1]
    ]
    return transformPointsWithMatrix(pointsArray, rotationMatrix)
}

const transformPointsWithMatrix = (pointsArray, rotationMatrix) => {
    const result = []
    pointsArray.forEach(point => {
        result.push(matrixMultiplyPoint(rotationMatrix, point))
    })
    return result
}

const matrixMultiplyPoint = (projectionMatrix, point3d) => {
    const pointMatrix = pointToMatrix(point3d)
    const projectionRows = projectionMatrix.length
    const projectionColumns = projectionMatrix[0].length
    const pointRows = pointMatrix[0].length;
    const pointColumns = pointMatrix.length;
    if (projectionColumns !== pointRows) {
        console.error('projection columns must match point rows')
        return null
    }
    const result = []

    /** Projection rows */
    for (let i = 0; i < projectionRows; i++) {
        result[i] = []
        /** Point columns (should be fixed at index 0) */
        for (let j = 0; j < pointColumns; j++) {
            let sum = 0;
            /** Projection columns = point rows */
            for (let k = 0; k < projectionColumns; k++) {
                sum += projectionMatrix[i][k] * pointMatrix[j][k]
            }
            result[i][j] = sum
        }
    }
    const [x, y] = result.map(row => row[0])
    /** Return as point object */
    return matrixToPoint(result)
}

const pointToMatrix = (pointObj) => {
    let matrix = [
        pointObj.x,
        pointObj.y,
        pointObj.z
    ]
    /** Return 2D array */
    return Array(matrix)
}

const matrixToPoint = (matrix) => {
    let point = {
        x: matrix[0][0],
        y: matrix[1][0]
    }
    if (matrix.length === 3) {
        point.z = matrix[2][0]
    } else {
        point.z = 0
    }
    return point
}

const mapRange = (originalValue, originalMin, originalMax, newMin, newMax) => {
    return ((originalValue - originalMin) / (originalMax - originalMin)) * (newMax - newMin) + newMin;
}

const transformPoints = (pointsArray, angle = 0, scale = 1, distance = 1) => {
    /** First rotate and scale, then project */
    const rotatedPointsX = rotationX(pointsArray, angle)
    const rotatedPointsY = rotationY(rotatedPointsX, angle)
    const rotatedPointsZ = rotationZ(rotatedPointsY, angle)
    const scaledPoints = scaleXYZ(rotatedPointsZ, scale)
    const projectedPoints = projectPoints(scaledPoints, distance)
    return projectedPoints
}

/** TODO: Connect edges */
let angle = 0

const initializeVertices = (pointsArray) => {
    pointsArray.forEach((point, index) => {
        const x = point.x + center.x
        const y = point.y + center.y
        const vertex = document.createElement('div')
        vertex.innerHTML = index
        vertex.classList.add('vertex')
        vertex.style.transform = `translate(${x}px, ${y}px)`
        vertex.setAttribute('data-vertex-id', index)
        cube.appendChild(vertex)
    })
    cube.addEventListener('click', handleClickVertex, false)
}

const updatePoints = (transformedPointsArray) => {
    const vertices = document.querySelectorAll('.vertex')
    transformedPointsArray.forEach((point, index) => {
        const x = point.x + center.x
        const y = point.y + center.y
        const vertex = vertices[index]
        vertex.style.transform = `translate(${x}px, ${y}px)`
    })
}

const connectPoints = (transformedPointsArray) => {
    const vertices = document.querySelectorAll('.vertex')
    document.querySelectorAll('.edge').forEach(edge => edge.remove());

    transformedPointsArray.forEach((point, index) => {
        const x = point.x
        const y = point.y
        const vertex = vertices[index]
        const nextVertex = vertices[(index + 1) % transformedPointsArray.length]

        // Calculate the angle between the current and next vertices
        const deltaX = nextVertex.offsetLeft - x;
        const deltaY = nextVertex.offsetTop - y;
        const angle = Math.atan2(deltaY, deltaX);

        // Calculate the length of the edge
        const length = Math.sqrt(deltaX ** 2 + deltaY ** 2);

        const edge = document.createElement('div')
        edge.classList.add('edge')
        edge.style.transform = `translate(${x}px, ${y}px)`
        edge.style.width = `${length}px`;


        edge.style.transform = `translate(${x}px, ${y}px) rotate(${angle}rad)`;
        vertex.appendChild(edge)

    })
}

const loop = (pointsArray) => {
    angle += 0.01
    let scale = 100
    const distance = 2
    const transformedPointsArray = transformPoints(pointsArray, angle, scale, distance)
    updatePoints(transformedPointsArray)
    connectPoints(transformedPointsArray)
    window.requestAnimationFrame(() => loop(pointsArray))
}


const handleClickVertex = (e) => {
    if (e.target.classList.contains('vertex')) {
        const vertexId = e.target.getAttribute('data-vertex-id');
        console.log('Vertex clicked with ID:', vertexId);
        const vertex = e.target
        const transformString = vertex.style.transform
        // Find the index of the opening parenthesis and comma
        const startIndex = transformString.indexOf('(')
        const commaIndex = transformString.indexOf(',')

        if (startIndex !== -1 && commaIndex !== -1) {
            // Extract x and y substrings
            const xSubstring = transformString.substring(startIndex + 1, commaIndex).trim()
            const ySubstring = transformString.substring(commaIndex + 1, transformString.length - 1).trim()

            // Parse x and y values
            const x = parseFloat(xSubstring)
            const y = parseFloat(ySubstring)

            info.innerHTML = `point x: ${x} <br />point y: ${y}`

        } else {
            info.innerHTML = "Invalid transform string"
        }
    }
}

initializeVertices(cubePointsArray)
loop(cubePointsArray)