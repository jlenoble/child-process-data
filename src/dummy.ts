// Does nothing, but will be forked by "./check-child-process" to portably access
// the ChildProcess constructor on initialization to create a proper ubiquitous validator.
import path from "path";

export default path.basename(__filename, ".js");
