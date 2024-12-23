import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';

const HIKSetup = () => {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    checkComponents();
  }, []);

  const checkComponents = () => {
    // Check if WebComponents are installed
    try {
      // In development, we'll skip ActiveX check
      if (process.env.NODE_ENV === 'development') {
        setIsInstalled(true);
        return;
      }
      
      const webComponent = new ActiveXObject('WebVideoCtrl.WebVideoCtrl');
      setIsInstalled(true);
    } catch (error) {
      setIsInstalled(false);
    }
  };

  const downloadComponents = () => {
    // You should host these files on your server
    window.open('/downloads/webComponents.exe', '_blank');
  };

  if (isInstalled) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Required Components</CardTitle>
        <p className="text-sm text-muted-foreground">
          HIKVision components are required to interact with controllers
        </p>
      </CardHeader>
      <CardContent>
        <Alert variant="warning">
          <AlertTitle>Components Not Found</AlertTitle>
          <AlertDescription>
            <p>To use HIKVision controllers, you need to install the required components.</p>
            <div className="mt-4">
              <Button onClick={downloadComponents}>
                Download Components
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default HIKSetup;
