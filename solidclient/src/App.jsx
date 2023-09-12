import { createSignal } from "solid-js";

function App() {
	const [tasks, setTasks] = createSignal([
		{ text: "Пример задачи", isEditing: false },
	]);
	const [newTask, setNewTask] = createSignal("");

	const addTask = () => {
		if (newTask()) {
			setTasks([...tasks(), { text: newTask(), isEditing: false }]);
			setNewTask("");
		}
	};

	const startEditing = (index) => {
		const updatedTasks = [...tasks()];
		updatedTasks[index].isEditing = true;
		setTasks(updatedTasks);
	};

	const finishEditing = (index, value) => {
		const updatedTasks = [...tasks()];
		updatedTasks[index].isEditing = false;
		updatedTasks[index].text = value;
		setTasks(updatedTasks);
	};

	const deleteTask = (index) => {
		const updatedTasks = [...tasks()];
		updatedTasks.splice(index, 1);
		setTasks(updatedTasks);
	};

	return (
		<div class="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
			<div class="relative py-3 sm:max-w-xl sm:mx-auto">
				<div class="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
					<div class="max-w-md mx-auto">
						<div class="flex items-center space-x-5">
							<input
								class="border p-2 w-full"
								placeholder="New task..."
								value={newTask()}
								onInput={(e) => setNewTask(e.target.value)}
							/>
							<button
								class="px-5 py-2 border-blue-500 border text-blue-500 rounded transition duration-300 hover:bg-blue-700 hover:text-white focus:outline-none"
								onClick={addTask}
							>
								Add
							</button>
						</div>
						<ul class="space-y-4 mt-6">
							<For each={tasks()} fallback={<li>Loading...</li>}>
								{(task, index) => (
									<>
										<Task task={task} />
									</>
								)}
							</For>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}

let Task = (task) => {
	console.log(task, task.task.text);
	return (
		<>
			{task.task.text}
			<br />
		</>
	);
};

export default App;
