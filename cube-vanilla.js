const info = document.querySelector('.info')
const cube = document.querySelector('.cube')
const vertices = document.querySelectorAll('.vertex')
const center = { x: cube.offsetWidth / 2, y: cube.offsetHeight / 2 }
const cubeSize = 100

info.innerHTML = `center x: ${center.x}, center y: ${center.y}`

const orthographicMatrix = [[1, 0, 0], [0, 1, 0]]

const pointsArray = [
    { x: -50, y: -50, z: 0 },
    { x: 50, y: -50, z: 0 },
    { x: 50, y: 50, z: 0 },
    { x: -50, y: 50, z: 0 }
]
const projectPoints = (pointsArray) => {
    const result = []
    pointsArray.forEach(point => {
        result.push(matrixMultiplyPoint(orthographicMatrix, point))
    })

    return result
}

const rotatePoints = (pointsArray, angle) => {
    const result = []
    const rotationMatrix = [
        [Math.cos(angle), Math.sin(angle) * -1, 0],
        [Math.sin(angle), Math.cos(angle), 0]
    ]
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

const transformPoints = (pointsArray, angle = 0) => {
    const projectedPoints = projectPoints(pointsArray)
    const rotatedPoints = rotatePoints(projectedPoints, angle)
    console.log('rotatedPoints', rotatedPoints)
    return rotatedPoints
}

const renderPoints = (transformedPoints) => {
    transformedPoints.forEach(point => {
        const x = point.x + center.x
        const y = point.y + center.y
        const vertex = document.createElement('div')
        vertex.classList.add('vertex')
        vertex.style.left = `${x}px`
        vertex.style.top = `${y}px`
        cube.appendChild(vertex)
    })
}

const render = () => {
    const transformedPoints = transformPoints(pointsArray, 30)
    renderPoints(transformedPoints)
}

render()