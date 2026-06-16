export default function ErrorAlert({ message }: { message: string }) {
  return <p className="message error">{message}</p>;
}
