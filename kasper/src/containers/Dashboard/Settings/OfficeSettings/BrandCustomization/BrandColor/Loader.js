import Skeleton from '@material-ui/lab/Skeleton';

export default function Loader() {
  return (
    <div className="d-flex flex-column align-items-center">
      <Skeleton variant="circle" width="4rem" height="4rem" />
      <Skeleton variant="text" width="4rem" height="20px" className="mt-1" />
    </div>
  );
}
