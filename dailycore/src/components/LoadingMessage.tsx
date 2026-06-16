export default function LoadingMessage({ text = 'Loading...' }: { text?: string }) {
  return <p className="message loading">{text}</p>;
}
