function initStars() {

	var i,
		r = 1000,
		starsGeometry = [ new THREE.Geometry(), new THREE.Geometry() ];

	for ( i = 0; i < 250; i ++ ) {

		var vertex = new THREE.Vector3();
		vertex.x = Math.random() * 2 - 1;
		vertex.y = Math.random() * 2 - 1;
		vertex.z = Math.random() * 2 - 1;
		vertex.multiplyScalar( r );

		starsGeometry[ 0 ].vertices.push( vertex );
	}

	for ( i = 0; i < 1500; i ++ ) {

		var vertex = new THREE.Vector3();
		vertex.x = Math.random() * 2 - 1;
		vertex.y = Math.random() * 2 - 1;
		vertex.z = Math.random() * 2 - 1;
		vertex.multiplyScalar( r );

		starsGeometry[ 1 ].vertices.push( vertex );

	}

	var stars;
	var size = 2;
	var starsMaterials = [
		new THREE.PointCloudMaterial( { color: 0xffffff, size: size, sizeAttenuation: false } ),
		new THREE.PointCloudMaterial( { color: 0xfffffe, size: size, sizeAttenuation: false } ),
		new THREE.PointCloudMaterial( { color: 0xeeeeee, size: size, sizeAttenuation: false } ),
		new THREE.PointCloudMaterial( { color: 0xffffff, size: size, sizeAttenuation: false } ),
		new THREE.PointCloudMaterial( { color: 0x1a1a1a, size: size, sizeAttenuation: false } ),
		new THREE.PointCloudMaterial( { color: 0x1a1a1a, size: size, sizeAttenuation: false } )
	];

	for ( i = 10; i < 30; i ++ ) {

		stars = new THREE.PointCloud( starsGeometry[ i % 2 ], starsMaterials[ i % 6 ] );

		stars.rotation.x = Math.random() * 6;
		stars.rotation.y = Math.random() * 6;
		stars.rotation.z = Math.random() * 6;

		s = 10000;
		stars.scale.set( s, s, s );

		stars.matrixAutoUpdate = false;
		stars.updateMatrix();

		scene.add( stars );

	}

}
