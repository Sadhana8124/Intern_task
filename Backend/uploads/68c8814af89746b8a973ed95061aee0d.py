import cv2
import numpy as np
import matplotlib.pylot as plt
live_camera=cv2.VedioCpture(0)
while(live_Camera.isOpened()):
    ret,frame=live_Camera.read()
    cv2.imshow("fire detection",frame)
    if cv2.waitKey(10)==27:
        break
    live_Camera.release()
    cv2.destoryAllWindows() 
