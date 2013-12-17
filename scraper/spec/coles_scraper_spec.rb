require_relative 'spec_helper'

describe ColesScraper do
  let(:scraper) {ColesScraper.new}
  let(:doc) {Nokogiri::XML::Document.parse( File.open(File.join File.dirname(__FILE__),'coles.xml').read)}

  it 'should load the doc' do
    expect(doc.root).not_to eq(nil)
  end

  it 'should get data from the doc' do
    scraper.get_data_from_xml_doc(doc)
    expect(scraper.data.length).to eq(37)
  end

  it 'should get data from saving node' do
    nodes = doc.root.xpath('//div[contains(@class,"promo save")]')
    scraper.get_saving_from_save_nodes nodes
    expect(scraper.data.length).to eq(25)
  end

  it 'should get data from multibuy node' do
    nodes = doc.root.xpath('//div[contains(@class,"promo multiBuy")]')
    scraper.get_saving_from_multibuy_nodes nodes
    expect(scraper.data.length).to eq(12)
  end

  it 'should get img and title from social node' do
    node = doc.root.xpath('//div[contains(@class,"promo save")]')[0].xpath('.//div[@id="share"]')
    info = scraper.get_info_from_social_node(node)
    expect(info[:img]).to eq('http://shop.coles.com.au/wcsstore/Coles-CAS/images/1/4/8/1489427-th.jpg')
    expect(info[:title]).to eq('Coles Fresh Tomatoes - Amoroso Truss Prepacked')
  end

end