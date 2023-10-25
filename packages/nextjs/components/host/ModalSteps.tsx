import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "../ui/Button";
import axios from "axios";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const ModalSteps = () => {
  const [nodeId, setNodeId] = useState();
  const router = useRouter();
  const dialogRef = useRef<RefObject<HTMLDivElement> | undefined>();

  const { writeAsync, isLoading } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "registerAsHost",
    args: [nodeId],
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
      router.push("/host");
    },
  });

  useEffect(() => {
    if (nodeId) {
      writeAsync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId]);

  const validateNodeId = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/v0/id");
      if (response.status === 200 && response.data) {
        const nodeId = response.data;
        return nodeId;
      }
      notification.error(`It looks you haven't follow the steps to be a host`);
    } catch (error) {
      notification.error(`It looks you haven't follow the steps to be a host`);
    }
  }, []);

  const beAHost = useCallback(async () => {
    const nodeId = await validateNodeId();
    if (nodeId) {
      setNodeId(nodeId);
      dialogRef.current.close();
    }
  }, [validateNodeId]);

  return (
    <dialog ref={dialogRef} id="my_modal_1" className="modal">
      <div className="modal-box">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 className="font-bold text-lg">Follow these instructions to be a host</h3>

        <ol
          className="p-3 prose"
          style={{
            listStyleType: "auto",
          }}
        >
          <li>
            Please download and install the Kubo daemon corresponding to your Operating System{" "}
            <a target="_blank" href="https://dist.ipfs.tech/#kubo">
              Kubo
            </a>
          </li>
          <li>
            Please download and install the plugin corresponding to your Operating System{" "}
            <a target="_blank" href="https://github.com/dProxSocks/kubo-socks/releases/tag/v0.1.1">
              Kubo-socks
            </a>
          </li>
          <li>
            Please run the following commands <code>kubo daemon</code> and <code>kubo-socks5</code>
          </li>
          <li>Please confirm the daemon and the plugin are running</li>
        </ol>
        <div className="modal-action">
          <Button onClick={beAHost}>Be a Host</Button>
        </div>
      </div>
    </dialog>
  );
};