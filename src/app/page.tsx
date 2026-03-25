import Login from "@/components/login/page"
import packageJson from "@/../package.json"
export default function Page() {
  return (
    <>
      <Login version={String(packageJson.version)}/>
    </>
  );
}
 