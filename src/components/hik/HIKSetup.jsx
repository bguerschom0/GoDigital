// src/components/hik/HIKSetup.jsx
import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardDescription,
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
      const webComponent = new ActiveXObject('WebVideoCtrl.WebVideoCtrl');
      setIsInstalled(true);
    } catch (error) {
      setIsInstalled(false);
    }
  };

  const downloadComponents = () => {
    // You should host these files on your server
    // or provide direct download links from HIKVision
    window.open('/downloads/webComponents.exe', '_blank');
  };

  if (isInstalled) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Required Components</CardTitle>
        <CardDescription>
          HIKVision components are required to interact with controllers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="warning">
          <AlertTitle>Components Not Found</AlertTitle>
          <AlertDescription>
            To use HIKVision controllers, you need to install the required components.
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
