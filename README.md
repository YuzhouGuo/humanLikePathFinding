# humanLikePathFinding
* The main purpose of this research project is to establish an idea to make a zig-zag path smooth and human-like.
* To have a detailed explanation about this project and how I approach, please visit the report named "Human-Like Path Finding Algorithm Based on Classic A*"

To show the result of this research/project, we choose a relatively larger map for testing. And here is a brutal presentation of the project:

Stage one (the classic A* algorithm without any adjustment)
* ![alt text](https://github.com/YuzhouGuo/humanLikePathFinding/blob/master/stage1.png)

Stage two (based on A*, with wall-avoiding algorithm added, you can see that the path is now trying to get to the middle of the path so that it is more human-like)
* ![alt text](https://github.com/YuzhouGuo/humanLikePathFinding/blob/master/stage2.png)

Stage three (with advanced wall-avoiding strategy, and Bezier curve applied, visually more smooth)
* ![alt text](https://github.com/YuzhouGuo/humanLikePathFinding/blob/master/stage3.png)

