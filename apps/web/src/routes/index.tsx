import { ClickUIProvider, Text, Title } from "@clickhouse/click-ui";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<ClickUIProvider theme="dark">
			<Title type="h1">Hello ClickHouse</Title>
			<Text>Start building today!</Text>
		</ClickUIProvider>
	);
}
