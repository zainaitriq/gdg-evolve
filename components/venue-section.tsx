export function VenueSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Join Us at HTU</h2>
            <p className="text-lg text-muted-foreground">
              Al-Hussein Technical University provides the perfect setting for our tech conference, with
              state-of-the-art facilities and a vibrant academic atmosphere.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Address</h3>
                <p className="text-muted-foreground">
                  Al-Hussein Technical University
                  <br />
                  Amman, Jordan
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Facilities</h3>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Modern auditoriums and lecture halls</li>
                  <li>• High-speed internet and AV equipment</li>
                  <li>• Computer labs for hands-on workshops</li>
                  <li>• Networking areas and exhibition spaces</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3384.5748742752994!2d35.832501199999996!3d31.972428100000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151ca17f274178b1%3A0xe04bf74531579108!2sAlHussein%20Technical%20University!5e0!3m2!1sen!2sjo!4v1755679700480!5m2!1sen!2sjo"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Al-Hussein Technical University Location"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
