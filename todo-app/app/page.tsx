"use client";
import React from "react";
import { stringify } from "querystring";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Select, SelectItem, Selection, Button } from "@nextui-org/react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip, Tooltip, ChipProps, getKeyValue } from "@nextui-org/react";
import { EditIcon } from "../components/EditIcon";
import { DeleteIcon } from "../components/DeleteIcon";
import { EyeIcon } from "../components/EyeIcon";
import { Input } from "@nextui-org/input";

interface Todo {
  task: string,
  priority: string,
  status: number,
  _id: string
}

const statusColorMap: Record<string, ChipProps["color"]> = {
  Completed: "success",
  InProgress: "warning",
  Blocked: "danger",
  OnHold: "default",
};
const columns = [
  { name: "TASK", uid: "task" },
  { name: "PRIORITY", uid: "priority" },
  { name: "STATUS", uid: "status" },
  { name: "ACTIONS", uid: "actions" },
];
const URL = "http://localhost:3000";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>();
  const [id, setId] = React.useState("");
  const [buttonTitle, setButtonTitle] = React.useState("Create");
  const [task, setTask] = React.useState("");
  const [status, setStatus] = React.useState<Selection>(new Set(["-1"]));
  const [priority, setPriority] = React.useState<Selection>(new Set(["-1"]));

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const todos = await fetchTodos();
    // console.log(todos);
    setTodos(todos);
  }
  const statuslst = [
    { key: "-1", label: "please select Status" },
    { key: "0", label: "Completed" },
    { key: "1", label: "InProgress" },
    { key: "2", label: "Blocked" },
    { key: "3", label: "OnHold" }
  ];
  const priorityColorMap: Record<string, ChipProps["color"]> = {
    High: "success",
    Medium: "warning",
    Low: "danger"   
  };
  const prioritylst = [
    { key: "-1", label: "please select priority" },
    { key: "High", label: "High" },
    { key: "Medium", label: "Medium" },
    { key: "Low", label: "Low" }
  ];

  async function fetchTodos(): Promise<Todo[]> {
    const response = await fetch(`${URL}/todos`);
    // console.log(await response.json());
    return await response.json();
  }
  async function handleCreate() {
    console.log(id);
    if (id && id.trim() !== '') {
      const newTodo: Todo = {
        _id: "",
        task: task,
        priority: Array.from(priority)[0].toString(),
        status: parseInt(Array.from(status)[0].toString())
      };
      console.log(newTodo);     
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      const response = await fetch(`${URL}/todos/${id}`, {
        method: "PUT",
        headers: myHeaders,
        body: JSON.stringify(newTodo),
      });
      console.log(response);   
      setButtonTitle("Create");   
      setTask("");
      setPriority(new Set([]));
      setStatus(new Set([]));
      setId("");     
    }
    else {
      const newTodo: Todo = {
        _id: "",
        task: task,
        priority: Array.from(priority)[0].toString(),
        status: parseInt(Array.from(status)[0].toString())
      };
      console.log(newTodo);
      const newState = [newTodo, ...todos!];
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      const response = await fetch(`${URL}/todos`, {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(newTodo),
      });
      console.log(response);
      setTodos(newState);
      setTask("");
      setPriority(new Set([]));
      setStatus(new Set([]));
      setId("");
    }
    fetchData();
    // return await response.json();    
  }

  async function OnDeleteClick(_id: string) {
    await fetch(`${URL}/todos/${_id}`, {
      method: "DELETE",
    });
    fetchData();
  }

  async function OnEditclick(todo: Todo) {
    // console.log(todo._id);
    setButtonTitle("Update");
    setId(todo._id);
    setTask(todo.task);
    setPriority(new Set([todo.priority]));
    setStatus(new Set([todo.status.toString()]));
    // return await response.json();    
  }
  const renderCell = React.useCallback((todo: Todo, columnKey: React.Key) => {
    // console.log(todo);
    // console.log(todos);
    const cellValue = todo[columnKey as keyof Todo];
    switch (columnKey) {
      case "task":
        return (
          <p className="text-bold text-sm capitalize">{cellValue}</p>
        );
      case "priority":
        return (
        <Chip className="capitalize" color={priorityColorMap[prioritylst.find(priority => priority.key === todo.priority)!.label]} size="md" variant="shadow">
          {prioritylst.find(priority => priority.key === todo.priority.toString())!.label}
        </Chip>         
        );
      case "status":
        return (
          <Chip className="capitalize" color={statusColorMap[statuslst.find(status => status.key === todo.status.toString())!.label]} size="sm" variant="flat">
            {statuslst.find(status => status.key === todo.status.toString())!.label}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            {/* <Tooltip content="Details">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EyeIcon />
              </span>
            </Tooltip> */}
            <Tooltip content="Edit user">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EditIcon onClick={() => OnEditclick(todo)} />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete user">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <DeleteIcon onClick={() => OnDeleteClick(todo._id)} />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, [todos]);

  if (!todos) {
    return <div>Loading...</div>;
  }
  return (
    <Card
      isBlurred
      className="border-none bg-background/60 dark:bg-default-100/50 "
      shadow="sm"
    >
      <CardBody>
        <div className="">
          <div>
            <h1 className="mb-6">TODO App</h1>
            {todos && (
              <div>
                <div className="flex flex-col gap-6 mb-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex w-full flex-wrap items-end md:flex-nowrap mb-6 md:mb-0 gap-4">
                      <Input
                        key="task"
                        type="text"
                        label="Task"
                        value={task}
                        onValueChange={setTask}
                        labelPlacement="inside"
                        size="sm"
                      />
                      <Select
                        label="Task Priority"
                        variant="bordered"
                        placeholder="Select an Priority"
                        selectedKeys={priority}
                        size="sm"
                        onSelectionChange={setPriority}
                      >
                        {prioritylst.map((status) => (
                          <SelectItem key={status.key}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </Select>
                      <Select
                        label="Task Status"
                        variant="bordered"
                        placeholder="Select an status"
                        selectedKeys={status}
                        size="sm"
                        onSelectionChange={setStatus}
                      >
                        {statuslst.map((status) => (
                          <SelectItem key={status.key}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </Select>
                      <Button className="mb-1" color="primary" onClick={handleCreate}>{buttonTitle}</Button>
                    </div>
                  </div>
                </div>
                <Table aria-label="Todo Table" selectionMode="single" defaultSelectedKeys={["2"]} >
                  <TableHeader columns={columns}>
                    {(column) => (
                      <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                        {column.name}
                      </TableColumn>
                    )}
                  </TableHeader>
                  <TableBody items={todos}>
                    {(item) => (
                      <TableRow key={item._id}>
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}