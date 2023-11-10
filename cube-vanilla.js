const info = document.querySelector('.info')
const cube = document.querySelector('.cube')
const vertices = document.querySelectorAll('.vertex')
const center = { x: cube.offsetWidth / 2, y: cube.offsetHeight / 2 }
const cubeSize = 100
let angle = 0

info.innerHTML = `center x: ${center.x}, center y: ${center.y}`

const pointsArray = [
    { x: -0.5, y: -0.5, z: -0.5 },
    { x: 0.5, y: -0.5, z: -0.5 },
    { x: 0.5, y: 0.5, z: -0.5 },
    { x: -0.5, y: 0.5, z: -0.5 },
    { x: -0.5, y: -0.5, z: 0.5 },
    { x: 0.5, y: -0.5, z: 0.5 },
    { x: 0.5, y: 0.5, z: 0.5 },
    { x: -0.5, y: 0.5, z: 0.5 }
]

const projectPoints = (pointsArray) => {
    const result = []
    const distance = 2.2
    pointsArray.forEach(point => {
        const f = 1 / (distance - point.z)
        const projectionMatrix = [[f, 0, 0], [0, f, 0], [0, 0, 1]]
        result.push(matrixMultiplyPoint(projectionMatrix, point))
    })
    return result
}

const rotationX = (pointsArray, angle) => {
    const rotationMatrix = [
        [1, 0, 0],
        [0, Math.cos(angle), Math.sin(angle) * -1],
        [0, Math.sin(angle), Math.cos(angle)]
    ]
    return transformPointsWithMatrix(pointsArray, rotationMatrix)
}

const rotationY = (pointsArray, angle) => {
    const rotationMatrix = [
        [Math.cos(angle), 0, Math.sin(angle) * -1],
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
        [Math.cos(angle), Math.sin(angle) * -1, 0],
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

const transformPoints = (pointsArray, angle = 0, scale = 1) => {
    /** First rotate and scale, then project */
    const rotatedPointsX = rotationX(pointsArray, angle)
    const rotatedPointsY = rotationY(rotatedPointsX, angle)
    const rotatedPointsZ = rotationZ(rotatedPointsY, angle)
    const scaledPoints = scaleXYZ(rotatedPointsZ, scale)
    const projectedPoints = projectPoints(scaledPoints)
    return projectedPoints
}

const mapRange = (originalValue, originalMin, originalMax, newMin, newMax) => {
    return ((originalValue - originalMin) / (originalMax - originalMin)) * (newMax - newMin) + newMin;
}

const renderPoints = (transformedPoints) => {
    cube.innerHTML = '';

    transformedPoints.forEach(point => {
        const originalValue = point.z
        const originalMin = -60;
        const originalMax = 80;
        const newMin = 0;
        const newMax = 1;
        const mappedValue = mapRange(originalValue, originalMin, originalMax, newMin, newMax);

        const x = point.x + center.x
        const y = point.y + center.y
        const vertex = document.createElement('div')
        vertex.innerHTML
        vertex.classList.add('vertex')
        vertex.style.left = `${x}px`
        vertex.style.top = `${y}px`
        vertex.style.backgroundColor = `rgb( 230, 55, 100, 1)`
        cube.appendChild(vertex)
    })
}

/** TODO: Connect edges */

const loop = () => {
    angle += 0.001
    scale = 120
    const transformedPoints = transformPoints(pointsArray, angle, scale)
    renderPoints(transformedPoints)
    window.requestAnimationFrame(loop)
}

loop()