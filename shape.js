import { radians, vec3 } from "mv-redux";


export class Shape{

    static Colors = { black: vec3(0.), white: vec3(1.) }
    static CUBE_INDICES = [
        0, 1, 2, 2, 3, 0, // Front
        4, 5, 6, 6, 7, 4, // Back
        1, 2, 5, 5, 6, 2, // Right
        0, 3, 4, 4, 7, 3, // Left
        0, 1, 4, 4, 5, 1, // Top
        2, 3, 6, 6, 7, 3,  // Bottom
    ];

    // Give random vertex color
    static rVec() {
        function getRandom() {
            return Math.round(Math.random() * 9999) / 10000; // Generate a number with 4 significant figures
        }
        return vec3(getRandom(), getRandom(), getRandom());
    }

    static getRandomColors(count){
        let colors = [];

        for (let i = 0; i < count; i++){
            colors.push(this.rVec());
        }
        return colors;
    }

    //- Maybe replace with Array from
    static getIndices(startIndex, count){
        return Array.from({ length: count }, (_, i) => i + startIndex);
    }

    static ensureColors(colors, count) {
        return Array.from({ length: count }, (_, i) => colors[i] || this.rVec());
    }
    

    /** Shape methods
     *  
     * Return vertexdata and indices
     */
    static getCube(position, size, colors =[], lastIndex = 0){
        let { x, y, z } = position;
        size = size / 2;

        // Just ensuring its appropriate 
        let vertices = [

            // Unit Cube
            //    x     y     z
            vec3( x - size, y + size, z + size), // Front top left
            vec3( x + size, y + size, z + size), // Front top right
            vec3( x + size, y - size, z + size), // Front bottom right
            vec3( x - size, y - size, z + size), // Front bottom left

            vec3( x - size, y + size, z - size), // Back top left
            vec3( x + size, y + size, z - size), // Back top right
            vec3( x + size, y - size, z - size), // Back bottom right
            vec3( x - size, y - size, z - size), // Back bottom left
        ];

        let indices = []; //? quicker way to do this?
        indices.push(...Shape.CUBE_INDICES.map(index => index + lastIndex));
        
        // Packaging
        let vertexData = [];
        for (let i = 0; i < vertices.length; i++) {
            vertexData[i] = [vertices[i], colors[i]];
        }

        return { vertexData: vertexData, indices: indices };    // arbitrary shape object (no class)(buts its a standard)
    }

    static getBase(colors = []){
        
        let vertices = [

            // Unit Cube
            //    x     y     z
            vec3( -0.5,  0.5,  0.5), // Front top left
            vec3(  0.5,  0.5,  0.5), // Front top right
            vec3(  0.5, -0.5,  0.5), // Front bottom right
            vec3( -0.5, -0.5,  0.5), // Front bottom left

            vec3( -0.5,  0.5, -0.5), // Back top left
            vec3(  0.5,  0.5, -0.5), // Back top right
            vec3(  0.5, -0.5, -0.5), // Back bottom right
            vec3( -0.5, -0.5, -0.5), // Back bottom left
        ];

        let indices = []; //? quicker way to do this?

        ///////////////////////////////////
        // Front and back for each
        indices.push(0, 1, 2);
        indices.push(2, 3, 0);

        indices.push(4, 5, 6);
        indices.push(6, 7, 4);

        indices.push(1, 2, 5);
        indices.push(5, 6, 2);

        indices.push(0, 3, 4);
        indices.push(4, 7, 3);

        indices.push(0, 1, 4);
        indices.push(4, 5, 1);

        indices.push(2, 3, 6);
        indices.push(6, 7, 3);
        
        // Packaging
        let vertexData = [];
        for (let i = 0; i < vertices.length; i++) {
            // vertexData[i] = [vertices[i], colors[i]];
            vertexData.push(...vertices[i],);
            // console.log(...vertices[i])
            vertexData.push( ...colors[i])
        }
        vertexData = vertexData.flat(2);

        return { vertexData: vertexData, indices: indices };  
    }

    static getPyramid(position, size, mag, colors, lastIndex = 0){

        let { x, y, z } = position;
        size = size / 2;

        /** VertexData */ 
        // We first set middle points
        let vertexData = [
            //    x  y  z
            vec3( x, y, z + size), 
            colors[0], 

            vec3( x, y, z - size),
            colors[0],
        ];

        // ...then set the one face
        let request = { position, colors, pts:mag };
        vertexData.push(...this.getPoints( request, - size, size, 1, true ));

        let indices = [];

        /** Indices */
        // Fan faces on both midpoints
        this.fanFace( indices, 2, 0, mag, lastIndex);
        this.fanFace( indices, 2, 1, mag, lastIndex);

        return { vertexData: vertexData, indices: indices }; 
    }

    static getPrism(position, size, mag, colors){

        let { x, y, z } = position;
        size /= 2;

        /** VertexData */ 
        //? or maybe better way to add color check if null and return random
        // We first set middle points
        let vertexData = [
            //   x  y  z
            vec3( x, y, 0), 
            colors[0], 

            vec3( x, y, z + size),
            colors[1],
        ]
        // ...then set the two faces, notice zvalue and colset
        let request = { position, colors, pts:mag }
        vertexData.push(...this.getPoints( request , 0, size, 1, true )); 
        vertexData.push(...this.getPoints( request, + size, size, 1, true, 1 ))

        /** Indices */
        let indices = [];
        // Fan both faces, then make wrapper
        this.fanFace( indices, 2, 0, mag);              // offset 2 for already defined middle points
        this.fanFace( indices, 2 + mag, 1, mag)   // ^ 2 + offset of other shape
        this.makeWrapper( indices, mag, 2);

        return { vertexData: vertexData, indices: indices }; 
    }

    static getSpere(position, size, mag, colors){

        let { x, y, z } = position;

        /** VertexData */ 
        let vertexData = [
            vec3(0, 0, z - size), 
            colors[0], 

            vec3(0, 0, z + size ),
            colors[1],
        ]
        let angle = Math.PI / (mag + 1);

        let request = { position, colors, pts: 2 * mag };
        for (let iter = angle; iter < Math.PI; iter += angle){
            /**
             * So the sphere is a stack of pancakes (shapes) with wrappers
             * zvalue is cos to get height and scale is sin to get width, imagine circle cos, sin
             * note getpoints uses same idea but laying down, this stacks it up
             */
            vertexData.push(
                ...this.getPoints(request, size * Math.cos(iter), size * Math.sin(iter), 2, true)
            )
        }

        /** Indices */
        let offset = 2 * mag;
        let indices = [];
        /** 
         * offset+> so we actually make size as a function of 180deg, for 360, we need 2 times
         *          each face will always be 180 deg
         * So we fan to the 'poles' and then wrap each layer ( in between )
         */
        this.fanFace(indices, 2, 1, offset)
        for (let i = 0; i < mag - 1; i++){
            this.makeWrapper(indices, offset, 2 + (i * offset))
        }
        this.fanFace(indices, 2 + ((mag - 1) * offset), 0, offset)

        return { vertexData: vertexData, indices: indices }; 
    }

    /** 
     * Calculation and utility functions 
     * */
    // This is main method for most shapes and configurations
    static getPoints({position, colors, pts}, zValue = 0, scale = 1, offset = 1, adcolor = false, colset = 0){ 
        
        /**
         * zvalue+> Height of the point,
         * scale+>  Scale of the entire face or shape
         * Offset+> offset of the angle. This is measured in relation to the angle, so offset of 2 is angle / 2
         *          so we wouldnt have to calculate, eg star has offset 2, tesselation might be 3
         * adcolor+> whether or not to bind the colors and return raw vertexdata
         * colset+> If there is a need for an offset when calling colors
        **/

        let angle = (2 * Math.PI) / pts;
        let iter = offset == 1 ? 0 : angle / offset;    
        iter = radians(45);
        let points = [];
        let data = vec3();

        for (let i = 0; i < pts; i++){
            iter += angle;  // ^ This thingy setup is too long to put in loop condtions 

            // Make points or make vertexdata
            data = vec3(
                position.x + Math.floor(scale * Math.sin(iter) * 9999) / 10000,  // x
                position.y + Math.floor(scale * Math.cos(iter) * 9999) / 10000,  // y
                position.z + zValue,                                              // z
            )

            console.log("added point", data);

            // Return vertexdata or just points
            if (!adcolor){
                points.push(data);
            }
            else {
                if (colors[i] == null)
                    colors[i] = this.rVec();
                points.push(data, colors[i + colset]) 
            }
        }
        return points;
    }

    // This method makes the faces, it can make a cone too if centre is elevated, eg pyramid, sphere
    static fanFace(indices, offset, centre, size, increment = 0, lastIndex = 0){

        /** 
         * offset +> Most shapes define middle before the points so we need an offset for the shape face
         * centre +> Index of defined centre point
         * It just connects all the points to the centre index 
         * */

        let x = size - 1, y = 0;
        // for (let i = 0; i < size; i++){
        //     // remove middle and add next one
        //     indices.push(centre, x + offset, y + offset);
        //     x = y;
        //     y += 1 + increment;
        // }

        //- Change
        // let x = lastIndex + size - 1, y = lastindex + 0;

        for (let i = 0; i < size; i++){
            // remove middle and add next one
            indices.push(lastIndex + centre, x + offset, y + offset);
            x = y;
            y += 1 + increment;
        }
    }

    // This makes the wrapper around two faces, eg sphere, prism // strip
    static makeWrapper(indices, size, offset){

        /** Simply put 
         * x y x1
         * x1 y1 y,  
        */
        let x = (size - 1) + offset, y = 0 + offset;
        for (let i = 0; i < size; i++){
            indices.push(x, y, x + size);
            indices.push(x + size, y + size, y);

            x = y;
            y += 1;
        }

        //- change
        // let x = lastIndex + (size - 1) + offset, y = lastIndex + 0 + offset;
        // for (let i = 0; i < size; i++){
        //     indices.push(x, y, x + size);
        //     indices.push(x + size, y + size, y);

        //     x = y;
        //     y += 1;
        // }
    }

    static processData(){

    }
}