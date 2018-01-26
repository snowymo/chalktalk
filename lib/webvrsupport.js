function startWebVR(vrDisplay, cvs){
	console.log(cvs);
  console.trace();
	vrDisplay.requestPresent([{ source: cvs }]).then(function() {
		console.log('Presenting to WebVR display');

		// Set the canvas size to the size of the vrDisplay viewport

		var leftEye = vrDisplay.getEyeParameters('left');
		var rightEye = vrDisplay.getEyeParameters('right');

		cvs.width = Math.max(leftEye.renderWidth, rightEye.renderWidth) * 2;
		cvs.height = Math.max(leftEye.renderHeight, rightEye.renderHeight);

		// stop the normal presentation, and start the vr presentation
		window.cancelAnimationFrame(normalSceneFrame);
		//drawVRScene();
	}).catch(function(error) {
		console.error(error);
	});
	
	//vrDisplay.requestPresent([{source : cvs}]);
	if(vrDisplay.isPresenting == true){
		clearInterval(interval);
	}
	
	/*
	myPromise.then(function() {
   // Some error may happen
   throw('An exception that would be caught');
}).catch(function() {
    console.log('error');
});
	*/
}

function displayPoseStats(pose) {
  var pos = pose.position;
  var orient = pose.orientation;
  var linVel = pose.linearVelocity;
  var linAcc = pose.linearAcceleration;
  var angVel = pose.angularVelocity;
  var angAcc = pose.angularAcceleration;

  posStats.textContent = 'Position: x ' + pos[0].toFixed(3) + ', y ' + pos[1].toFixed(3) + ', z ' + pos[2].toFixed(3);
  orientStats.textContent = 'Orientation: x ' + orient[0].toFixed(3) + ', y ' + orient[1].toFixed(3) + ', z ' + orient[2].toFixed(3);
  linVelStats.textContent = 'Linear velocity: x ' + linVel[0].toFixed(3) + ', y ' + linVel[1].toFixed(3) + ', z ' + linVel[2].toFixed(3);
  angVelStats.textContent = 'Angular velocity: x ' + angVel[0].toFixed(3) + ', y ' + angVel[1].toFixed(3) + ', z ' + angVel[2].toFixed(3);

  if(linAcc) {
    linAccStats.textContent = 'Linear acceleration: x ' + linAcc[0].toFixed(3) + ', y ' + linAcc[1].toFixed(3) + ', z ' + linAcc[2].toFixed(3);
  } else {
    linAccStats.textContent = 'Linear acceleration not reported';
  }

  if(angAcc) {
    angAccStats.textContent = 'Angular acceleration: x ' + angAcc[0].toFixed(3) + ', y ' + angAcc[1].toFixed(3) + ', z ' + angAcc[2].toFixed(3);
  } else {
    angAccStats.textContent = 'Angular acceleration not reported';
  }
}

function drawVRScene() {
  // WebVR: Request the next frame of the animation
  vrSceneFrame = vrDisplay.requestAnimationFrame(drawVRScene);

  // Populate frameData with the data of the next frame to display
  vrDisplay.getFrameData(frameData);

  // You can get the position, orientation, etc. of the display from the current frame's pose

  var curFramePose = frameData.pose;
  var curPos = curFramePose.position;
  var curOrient = curFramePose.orientation;
  if(poseStatsDisplayed) {
    displayPoseStats(curFramePose);
  }

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // WebVR: Create the required projection and view matrix locations needed
  // for passing into the uniformMatrix4fv methods below

  var projectionMatrixLocation = gl.getUniformLocation(shaderProgram, "projMatrix");
  var viewMatrixLocation = gl.getUniformLocation(shaderProgram, "viewMatrix");

  // WebVR: Render the left eye’s view to the left half of the canvas
  gl.viewport(0, 0, canvas.width * 0.5, canvas.height);
  gl.uniformMatrix4fv(projectionMatrixLocation, false, frameData.leftProjectionMatrix);
  gl.uniformMatrix4fv(viewMatrixLocation, false, frameData.leftViewMatrix);
  drawGeometry();

  // WebVR: Render the right eye’s view to the right half of the canvas
  gl.viewport(canvas.width * 0.5, 0, canvas.width * 0.5, canvas.height);
  gl.uniformMatrix4fv(projectionMatrixLocation, false, frameData.rightProjectionMatrix);
  gl.uniformMatrix4fv(viewMatrixLocation, false, frameData.rightViewMatrix);
  drawGeometry();

  // Update the rotation for the next draw, if it's time to do so.

  var currentTime = (new Date).getTime();
  if (lastCubeUpdateTime) {
    var delta = currentTime - lastCubeUpdateTime;

    cubeRotation += (30 * delta) / 1000.0;
  }

  lastCubeUpdateTime = currentTime;

  // WebVR: Indicate that we are ready to present the rendered frame to the VR display
  vrDisplay.submitFrame();
}

/* function findVRDisplay(obj){
	if(navigator.getVRDisplays) {
      console.log('WebVR 1.1 supported');
      // Then get the displays attached to the computer
      navigator.getVRDisplays().then(function(displays) {
        // If a display is available, use it to present the scene
        if(displays.length > 0) {
          console.log('[hehe] Display found');
		  obj.val = displays[0];
		}
	  })
	}else{
		console.log("[hehe] Display not found");
	}
} */
